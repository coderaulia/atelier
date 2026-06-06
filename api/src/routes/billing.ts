import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import { emailTemplates, sendEmail } from '../lib/email'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import { getAppUrl } from '../lib/config'
import type { Bindings } from '../types'

const billing = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

const webhookSchema = z.object({
  order_id: z.string().optional(),
  transaction_status: z.string(),
  payment_type: z.string().optional(),
  gross_amount: z.string().optional(),
  currency: z.string().optional(),
  custom_field1: z.string().optional(), // user_id
})

function fmt(ts: number | null) {
  return ts ? new Date(ts * 1000).toISOString().slice(0, 10) : 'end of current period'
}

async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-512', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

billing.get('/status', authMiddleware, async (c) => {
  const user = await c.env.DB
    .prepare('SELECT plan, pro_expires_at, cancel_at_period_end, grace_until FROM users WHERE id = ?')
    .bind(c.var.userId)
    .first<{ plan: 'free' | 'pro'; pro_expires_at: number | null; cancel_at_period_end: number; grace_until: number | null }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json(user)
})

billing.post('/cancel', authMiddleware, async (c) => {
  const user = await c.env.DB
    .prepare('SELECT email, plan, pro_expires_at FROM users WHERE id = ?')
    .bind(c.var.userId)
    .first<{ email: string; plan: string; pro_expires_at: number | null }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.plan !== 'pro') return c.json({ error: 'No active Pro subscription' }, 400)

  await c.env.DB
    .prepare('UPDATE users SET cancel_at_period_end = 1 WHERE id = ?')
    .bind(c.var.userId)
    .run()

  const expiryDate = fmt(user.pro_expires_at)
  const t = emailTemplates('en')
  sendEmail({ to: user.email, subject: t.subscriptionCancelledSubject, html: t.subscriptionCancelledBody(expiryDate) }, c.env.RESEND_API_KEY).catch(() => {})

  return c.json({ ok: true, pro_expires_at: user.pro_expires_at, cancel_at_period_end: true })
})

billing.post('/reactivate', authMiddleware, async (c) => {
  const user = await c.env.DB
    .prepare('SELECT plan, cancel_at_period_end FROM users WHERE id = ?')
    .bind(c.var.userId)
    .first<{ plan: string; cancel_at_period_end: number }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.plan !== 'pro') return c.json({ error: 'No active Pro subscription' }, 400)
  if (!user.cancel_at_period_end) return c.json({ error: 'Subscription not cancelled' }, 400)

  await c.env.DB
    .prepare('UPDATE users SET cancel_at_period_end = 0 WHERE id = ?')
    .bind(c.var.userId)
    .run()

  return c.json({ ok: true })
})

billing.post('/transactions', authMiddleware, async (c) => {
  const rows = await c.env.DB
    .prepare('SELECT id, amount, currency, plan_type, status, midtrans_order_id, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC')
    .bind(c.var.userId)
    .all()
  return c.json({ transactions: rows.results ?? [] })
})

billing.get('/transactions', authMiddleware, async (c) => {
  const rows = await c.env.DB
    .prepare('SELECT id, amount, currency, plan_type, status, midtrans_order_id, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC')
    .bind(c.var.userId)
    .all()
  return c.json({ transactions: rows.results ?? [] })
})

billing.post('/checkout', authMiddleware, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || body.plan_type !== 'pro-monthly') return c.json({ error: 'Invalid plan' }, 400)

  const user = await c.env.DB
    .prepare('SELECT email, first_name, last_name FROM users WHERE id = ?')
    .bind(c.var.userId)
    .first<{ email: string; first_name: string; last_name: string }>()

  if (!user) return c.json({ error: 'User not found' }, 404)

  const orderId = `PRO-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const payload = {
    transaction_details: { order_id: orderId, gross_amount: 140000 },
    customer_details: { first_name: user.first_name || 'User', last_name: user.last_name || '', email: user.email },
    custom_field1: c.var.userId,
  }

  const isSandbox = (c.env.MIDTRANS_BASE_URL || '').includes('sandbox')
  const snapUrl = isSandbox ? 'https://app.sandbox.midtrans.com/snap/v1/transactions' : 'https://app.midtrans.com/snap/v1/transactions'
  const authString = btoa(`${c.env.MIDTRANS_SERVER_KEY}:`)
  
  const response = await fetch(snapUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Basic ${authString}` },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    console.error('Midtrans Snap Error:', await response.text())
    return c.json({ error: 'Failed to create checkout' }, 500)
  }

  const data = await response.json<{ token: string }>()
  return c.json({ snap_token: data.token, order_id: orderId })
})

// Midtrans recurring lifecycle webhook.
// Recurring should use Midtrans Core API token-based recurring charges.
// Snap is for initial checkout; saved card token then powers recurring Core API charges.
billing.post('/webhook', async (c) => {
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `billing:webhook:${ip}`, 60, 10)
  if (!limit.allowed) return c.json({ error: 'Too many webhook requests', reset_at: limit.resetAt }, 429)

  const body = await c.req.json().catch(() => null)
  const result = webhookSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid webhook' }, 400)

  const event = result.data
  const userId = event.custom_field1
  if (!userId) return c.json({ error: 'Missing user id' }, 400)
  if (!event.order_id || !event.gross_amount || !c.env.MIDTRANS_SERVER_KEY) {
    return c.json({ error: 'Missing signature fields' }, 400)
  }

  const signature = c.req.header('X-Midtrans-Signature') ?? c.req.header('x-signature-key')
  const expectedSignature = await sha512Hex(`${event.order_id}${event.transaction_status}${event.gross_amount}${c.env.MIDTRANS_SERVER_KEY}`)
  if (!signature || !timingSafeEqual(signature.toLowerCase(), expectedSignature)) {
    return c.json({ error: 'Invalid signature' }, 403)
  }

  const now = Math.floor(Date.now() / 1000)
  const thirtyDays = 30 * 24 * 60 * 60

  if (event.transaction_status === 'settlement' || event.transaction_status === 'capture') {
    const existing = await c.env.DB
      .prepare('SELECT id FROM transactions WHERE midtrans_order_id = ?')
      .bind(event.order_id)
      .first<{ id: number }>()
    if (existing) return c.json({ ok: true })

    const user = await c.env.DB
      .prepare('SELECT email, pro_expires_at FROM users WHERE id = ?')
      .bind(userId)
      .first<{ email: string; pro_expires_at: number | null }>()

    const base = user?.pro_expires_at && user.pro_expires_at > now ? user.pro_expires_at : now
    const nextRenewal = base + thirtyDays

    await c.env.DB
      .prepare('UPDATE users SET plan = ?, pro_expires_at = ?, grace_until = NULL, cancel_at_period_end = 0 WHERE id = ?')
      .bind('pro', nextRenewal, userId)
      .run()

    await c.env.DB
      .prepare('INSERT INTO transactions (user_id, amount, currency, plan_type, status, midtrans_order_id) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, Number(event.gross_amount ?? 0), event.currency ?? 'IDR', 'pro', 'success', event.order_id ?? null)
      .run()

    if (user?.email) {
      const t = emailTemplates('en')
      sendEmail({
        to: user.email,
        subject: t.subscriptionConfirmedSubject,
        html: t.subscriptionConfirmedBody(Number(event.gross_amount ?? 0), event.currency ?? 'IDR', fmt(nextRenewal)),
      }, c.env.RESEND_API_KEY).catch(() => {})
    }
  }

  if (event.transaction_status === 'deny' || event.transaction_status === 'expire') {
    const dup = await c.env.DB
      .prepare('SELECT id FROM transactions WHERE midtrans_order_id = ?')
      .bind(event.order_id)
      .first<{ id: number }>()
    if (dup) return c.json({ ok: true })

    const graceUntil = now + 3 * 24 * 60 * 60
    const user = await c.env.DB
      .prepare('SELECT email FROM users WHERE id = ?')
      .bind(userId)
      .first<{ email: string }>()

    await c.env.DB
      .prepare('UPDATE users SET grace_until = ? WHERE id = ?')
      .bind(graceUntil, userId)
      .run()

    await c.env.DB
      .prepare('INSERT INTO transactions (user_id, amount, currency, plan_type, status, midtrans_order_id) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, Number(event.gross_amount ?? 0), event.currency ?? 'IDR', 'pro', 'failed', event.order_id ?? null)
      .run()

    if (user?.email) {
      const t = emailTemplates('en')
      const retryUrl = `${getAppUrl(c.env.APP_URL)}/pricing`
      sendEmail({ to: user.email, subject: t.paymentFailedSubject, html: t.paymentFailedBody(retryUrl) }, c.env.RESEND_API_KEY).catch(() => {})
    }
  }

  return c.json({ ok: true })
})

billing.get('/receipt/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const tx = await c.env.DB
    .prepare('SELECT t.id, t.amount, t.currency, t.plan_type, t.status, t.midtrans_order_id, t.created_at, u.email FROM transactions t JOIN users u ON u.id = t.user_id WHERE t.id = ? AND t.user_id = ?')
    .bind(id, c.var.userId)
    .first()
  if (!tx) return c.json({ error: 'Receipt not found' }, 404)
  return c.json({ transaction: tx })
})

export default billing
