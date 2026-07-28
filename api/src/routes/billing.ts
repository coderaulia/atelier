import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import { emailTemplates, sendEmail } from '../lib/email'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import { getAppUrl } from '../lib/config'
import { PRICING, type PackId, type ProTier } from '../lib/pricing'
import type { Bindings } from '../types'

const billing = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

const webhookSchema = z.object({
  order_id: z.string().optional(),
  transaction_status: z.string(),
  payment_type: z.string().optional(),
  gross_amount: z.string().optional(),
  currency: z.string().optional(),
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

// Public — powers frontend pricing page and upgrade CTAs, no auth required.
billing.get('/pricing', (c) => {
  return c.json(PRICING)
})

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
  sendEmail({ to: user.email, subject: t.subscriptionCancelledSubject, html: t.subscriptionCancelledBody(expiryDate) }, c.env.BREVO_API_KEY).catch(() => {})

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

async function listTransactions(c: { env: Bindings; var: AuthVariables; req: { query: (key: string) => string | undefined } }) {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const offset = (page - 1) * limit
  const rows = await c.env.DB
    .prepare('SELECT id, amount, currency, plan_type, status, midtrans_order_id, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(c.var.userId, limit, offset)
    .all()
  return { page, limit, transactions: rows.results ?? [] }
}

billing.post('/transactions', authMiddleware, async (c) => {
  return c.json(await listTransactions(c))
})

billing.get('/transactions', authMiddleware, async (c) => {
  return c.json(await listTransactions(c))
})

const TIERS = new Set<ProTier>(['starter', 'pro', 'business'])
const PACK_IDS = new Set<PackId>(['cv-10', 'social-50'])

type CheckoutOrder = {
  order_id: string
  user_id: string
  purchase_type: 'subscription' | 'pack'
  product_id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'processed' | 'failed'
  processing_token: string | null
}

type CheckoutCreation = {
  order_id: string
  snap_token: string | null
  created: boolean
}

async function createCheckoutOrder(
  c: { env: Bindings },
  orderId: string,
  userId: string,
  purchaseType: CheckoutOrder['purchase_type'],
  productId: string,
  amount: number,
  idempotencyKey: string | null,
): Promise<CheckoutCreation> {
  try {
    const created = await c.env.DB.prepare(
    `INSERT INTO checkout_orders (order_id, user_id, purchase_type, product_id, amount, currency, idempotency_key)
     VALUES (?, ?, ?, ?, ?, 'IDR', ?)
     RETURNING order_id, snap_token`
    ).bind(orderId, userId, purchaseType, productId, amount, idempotencyKey).first<{ order_id: string; snap_token: string | null }>()
    if (!created) throw new Error('Checkout order was not created')
    return { ...created, created: true }
  } catch {
    // A second click may use a different key, so the active-purchase unique
    // index is deliberately the fallback deduplication boundary.
    const existing = await c.env.DB.prepare(
      `SELECT order_id, snap_token FROM checkout_orders
       WHERE user_id = ? AND purchase_type = ?
         AND (purchase_type = 'subscription' OR product_id = ?)
         AND status IN ('pending', 'processing')
       ORDER BY created_at DESC LIMIT 1`
    ).bind(userId, purchaseType, productId).first<{ order_id: string; snap_token: string | null }>()
    if (!existing) throw new Error('Checkout order creation failed')
    return { ...existing, created: false }
  }
}

async function markCheckoutFailed(c: { env: Bindings }, orderId: string) {
  await c.env.DB.prepare(
    "UPDATE checkout_orders SET status = 'failed', updated_at = ? WHERE order_id = ? AND status = 'pending'"
  ).bind(Math.floor(Date.now() / 1000), orderId).run()
}

async function saveSnapToken(c: { env: Bindings }, orderId: string, token: string) {
  await c.env.DB.prepare(
    "UPDATE checkout_orders SET snap_token = ?, updated_at = ? WHERE order_id = ? AND status = 'pending'"
  ).bind(token, Math.floor(Date.now() / 1000), orderId).run()
}

async function createSnapTransaction(
  c: { env: Bindings },
  orderId: string,
  grossAmount: number,
  customer: { first_name: string; last_name: string; email: string },
) {
  const payload = {
    transaction_details: { order_id: orderId, gross_amount: grossAmount },
    customer_details: customer,
  }

  const isSandbox = (c.env.MIDTRANS_BASE_URL || '').includes('sandbox')
  const snapUrl = isSandbox ? 'https://app.sandbox.midtrans.com/snap/v1/transactions' : 'https://app.midtrans.com/snap/v1/transactions'
  const authString = btoa(`${c.env.MIDTRANS_SERVER_KEY}:`)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  let response: Response
  try {
    response = await fetch(snapUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Basic ${authString}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    console.error('Midtrans Snap request failed with status:', response.status)
    return null
  }

  return response.json<{ token: string }>()
}

// Subscription checkout — starter / pro / business, billed monthly in IDR.
billing.post('/checkout', authMiddleware, async (c) => {
  const body = await c.req.json().catch(() => null)
  const tier = body?.tier as ProTier | undefined
  if (!tier || !TIERS.has(tier)) return c.json({ error: 'Invalid plan' }, 400)

  const user = await c.env.DB
    .prepare('SELECT email, first_name, last_name FROM users WHERE id = ?')
    .bind(c.var.userId)
    .first<{ email: string; first_name: string; last_name: string }>()

  if (!user) return c.json({ error: 'User not found' }, 404)

  const orderId = `SUB_${tier}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  const grossAmount = PRICING.pro[tier].idr.amount

  const checkout = await createCheckoutOrder(c, orderId, c.var.userId, 'subscription', tier, grossAmount, c.req.header('Idempotency-Key') ?? null)
  if (!checkout.created) {
    if (!checkout.snap_token) return c.json({ error: 'Checkout is being initialized; retry shortly' }, 409)
    return c.json({ snap_token: checkout.snap_token, order_id: checkout.order_id })
  }

  let data: { token: string } | null = null
  try {
    data = await createSnapTransaction(
      c,
      checkout.order_id,
      grossAmount,
      { first_name: user.first_name || 'User', last_name: user.last_name || '', email: user.email },
    )
  } catch {
    await markCheckoutFailed(c, checkout.order_id)
    return c.json({ error: 'Failed to create checkout' }, 502)
  }
  if (!data) {
    await markCheckoutFailed(c, checkout.order_id)
    return c.json({ error: 'Failed to create checkout' }, 502)
  }

  await saveSnapToken(c, checkout.order_id, data.token)
  return c.json({ snap_token: data.token, order_id: checkout.order_id })
})

// One-time credit pack checkout — adds credits, doesn't touch plan/tier.
billing.post('/checkout-pack', authMiddleware, async (c) => {
  const body = await c.req.json().catch(() => null)
  const packId = body?.pack_id as PackId | undefined
  if (!packId || !PACK_IDS.has(packId)) return c.json({ error: 'Invalid pack' }, 400)

  const user = await c.env.DB
    .prepare('SELECT email, first_name, last_name FROM users WHERE id = ?')
    .bind(c.var.userId)
    .first<{ email: string; first_name: string; last_name: string }>()

  if (!user) return c.json({ error: 'User not found' }, 404)

  const orderId = `PACK_${packId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  const grossAmount = PRICING.packs[packId].idr.amount

  const checkout = await createCheckoutOrder(c, orderId, c.var.userId, 'pack', packId, grossAmount, c.req.header('Idempotency-Key') ?? null)
  if (!checkout.created) {
    if (!checkout.snap_token) return c.json({ error: 'Checkout is being initialized; retry shortly' }, 409)
    return c.json({ snap_token: checkout.snap_token, order_id: checkout.order_id })
  }

  let data: { token: string } | null = null
  try {
    data = await createSnapTransaction(
      c,
      checkout.order_id,
      grossAmount,
      { first_name: user.first_name || 'User', last_name: user.last_name || '', email: user.email },
    )
  } catch {
    await markCheckoutFailed(c, checkout.order_id)
    return c.json({ error: 'Failed to create checkout' }, 502)
  }
  if (!data) {
    await markCheckoutFailed(c, checkout.order_id)
    return c.json({ error: 'Failed to create checkout' }, 502)
  }

  await saveSnapToken(c, checkout.order_id, data.token)
  return c.json({ snap_token: data.token, order_id: checkout.order_id })
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
  const isSuccess = event.transaction_status === 'settlement' || event.transaction_status === 'capture'
  const isFailure = event.transaction_status === 'deny' || event.transaction_status === 'expire'
  if (!isSuccess && !isFailure) return c.json({ ok: true })

  // Ownership and pricing are server-side facts. Callback metadata is never
  // used to select a user or product because it is not covered by the signature.
  const order = await c.env.DB.prepare(
    `SELECT order_id, user_id, purchase_type, product_id, amount, currency, status
     FROM checkout_orders WHERE order_id = ?`
  ).bind(event.order_id).first<CheckoutOrder>()

  if (!order) return c.json({ error: 'Unknown checkout order' }, 400)
  if (order.status === 'processed' || order.status === 'failed') return c.json({ ok: true })

  const eventAmount = Number(event.gross_amount)
  const eventCurrency = (event.currency ?? 'IDR').toUpperCase()
  if (!Number.isFinite(eventAmount) || eventAmount !== order.amount || eventCurrency !== order.currency.toUpperCase()) {
    return c.json({ error: 'Checkout details do not match' }, 400)
  }

  // Claim once; abandoned claims can be retried after five minutes.
  const processingToken = crypto.randomUUID()
  const claimed = await c.env.DB.prepare(
    `UPDATE checkout_orders SET status = 'processing', processing_token = ?, updated_at = ?
     WHERE order_id = ? AND (status = 'pending' OR (status = 'processing' AND updated_at < ?))
     RETURNING order_id`
  ).bind(processingToken, now, order.order_id, now - 300).first<{ order_id: string }>()
  if (!claimed) return c.json({ ok: true })

  try {
    if (isSuccess && order.purchase_type === 'pack') {
      const packId = order.product_id as PackId
      if (!PACK_IDS.has(packId)) throw new Error('Invalid stored pack')
      const pack = PRICING.packs[packId]

      await c.env.DB.batch([
        c.env.DB.prepare(
          `INSERT INTO credit_packs (user_id, pack_type, credits_total)
           SELECT user_id, ?, ? FROM checkout_orders
           WHERE order_id = ? AND status = 'processing' AND processing_token = ?`
        ).bind(packId, pack.credits, order.order_id, processingToken),
        c.env.DB.prepare(
          `INSERT INTO transactions (user_id, amount, currency, plan_type, status, midtrans_order_id)
           SELECT user_id, amount, currency, ?, 'success', order_id FROM checkout_orders
           WHERE order_id = ? AND status = 'processing' AND processing_token = ?`
        ).bind(`pack:${packId}`, order.order_id, processingToken),
        c.env.DB.prepare("UPDATE checkout_orders SET status = 'processed', processing_token = NULL, updated_at = ? WHERE order_id = ? AND status = 'processing' AND processing_token = ?")
          .bind(now, order.order_id, processingToken),
      ])
      return c.json({ ok: true })
    }

    if (isSuccess) {
      const tier = order.product_id as ProTier
      if (order.purchase_type !== 'subscription' || !TIERS.has(tier)) throw new Error('Invalid stored subscription')

      const user = await c.env.DB.prepare('SELECT email, pro_expires_at FROM users WHERE id = ?')
        .bind(order.user_id)
        .first<{ email: string; pro_expires_at: number | null }>()
      if (!user) throw new Error('Checkout user not found')

      const base = user.pro_expires_at && user.pro_expires_at > now ? user.pro_expires_at : now
      const nextRenewal = base + thirtyDays

      await c.env.DB.batch([
        c.env.DB.prepare(
          `UPDATE users SET plan = ?, pro_tier = ?, pro_expires_at = ?, grace_until = NULL, cancel_at_period_end = 0, version = version + 1
           WHERE id = ? AND EXISTS (
             SELECT 1 FROM checkout_orders WHERE order_id = ? AND status = 'processing' AND processing_token = ?
           )`
        ).bind('pro', tier, nextRenewal, order.user_id, order.order_id, processingToken),
        c.env.DB.prepare(
          `INSERT INTO transactions (user_id, amount, currency, plan_type, status, midtrans_order_id)
           SELECT user_id, amount, currency, ?, 'success', order_id FROM checkout_orders
           WHERE order_id = ? AND status = 'processing' AND processing_token = ?`
        ).bind(tier, order.order_id, processingToken),
        c.env.DB.prepare("UPDATE checkout_orders SET status = 'processed', processing_token = NULL, updated_at = ? WHERE order_id = ? AND status = 'processing' AND processing_token = ?")
          .bind(now, order.order_id, processingToken),
      ])

      const t = emailTemplates('en')
      sendEmail({
        to: user.email,
        subject: t.subscriptionConfirmedSubject,
        html: t.subscriptionConfirmedBody(order.amount, order.currency, fmt(nextRenewal)),
      }, c.env.BREVO_API_KEY).catch(() => {})
      return c.json({ ok: true })
    }

    const planType = order.purchase_type === 'pack' ? `pack:${order.product_id}` : order.product_id
    const statements = [
      c.env.DB.prepare(
        `INSERT INTO transactions (user_id, amount, currency, plan_type, status, midtrans_order_id)
         SELECT user_id, amount, currency, ?, 'failed', order_id FROM checkout_orders
         WHERE order_id = ? AND status = 'processing' AND processing_token = ?`
      ).bind(planType, order.order_id, processingToken),
    ]

    let failureEmail: string | undefined
    if (order.purchase_type === 'subscription') {
      const user = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?')
        .bind(order.user_id)
        .first<{ email: string }>()
      failureEmail = user?.email
      statements.push(
        c.env.DB.prepare(
          `UPDATE users SET grace_until = ?, version = version + 1 WHERE id = ? AND EXISTS (
            SELECT 1 FROM checkout_orders WHERE order_id = ? AND status = 'processing' AND processing_token = ?
          )`
        ).bind(now + 3 * 24 * 60 * 60, order.user_id, order.order_id, processingToken)
      )
    }

    statements.push(
      c.env.DB.prepare("UPDATE checkout_orders SET status = 'failed', processing_token = NULL, updated_at = ? WHERE order_id = ? AND status = 'processing' AND processing_token = ?")
        .bind(now, order.order_id, processingToken)
    )
    await c.env.DB.batch(statements)

    if (failureEmail) {
      const t = emailTemplates('en')
      const retryUrl = `${getAppUrl(c.env.APP_URL)}/pricing`
      sendEmail({ to: failureEmail, subject: t.paymentFailedSubject, html: t.paymentFailedBody(retryUrl) }, c.env.BREVO_API_KEY).catch(() => {})
    }
    return c.json({ ok: true })
  } catch {
    await c.env.DB.prepare(
      "UPDATE checkout_orders SET status = 'pending', processing_token = NULL, updated_at = ? WHERE order_id = ? AND status = 'processing' AND processing_token = ?"
    ).bind(Math.floor(Date.now() / 1000), order.order_id, processingToken).run()
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
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
