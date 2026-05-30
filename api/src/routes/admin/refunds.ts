import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { getClientIP } from '../../lib/rate-limit'
import type { Bindings } from '../../types'

const refundsAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
refundsAdmin.use('*', adminMiddleware)

const createRefundSchema = z.object({
  transaction_id: z.number().int(),
  amount: z.number().int().min(1),
  reason: z.string().min(5).max(500),
  user_id: z.string(),
})

const processRefundSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed']),
  notes: z.string().max(500).optional(),
})

// List refund requests
refundsAdmin.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const status = c.req.query('status')
  const offset = (page - 1) * limit
  const values: unknown[] = []
  const filters: string[] = []

  if (status && ['pending', 'approved', 'rejected', 'completed'].includes(status)) {
    filters.push('r.status = ?')
    values.push(status)
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const rows = await c.env.DB.prepare(
    `SELECT r.id, r.transaction_id, r.user_id, u.email AS user_email,
            r.amount, r.currency, r.reason, r.status, r.usage_count,
            r.requested_at, r.processed_at, r.notes
     FROM refunds r
     LEFT JOIN users u ON u.id = r.user_id
     ${where}
     ORDER BY
       CASE r.status WHEN 'pending' THEN 0 ELSE 1 END,
       r.requested_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(...values, limit, offset)
    .all()

  const total = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM refunds r ${where}`)
    .bind(...values)
    .first<{ count: number }>()

  return c.json({ page, limit, total: total?.count ?? 0, refunds: rows.results ?? [] })
})

// Create refund request (admin-initiated)
refundsAdmin.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = createRefundSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid refund request', details: result.error.issues }, 400)

  const { transaction_id, user_id, amount, reason } = result.data

  // Validate transaction exists and belongs to user
  const tx = await c.env.DB
    .prepare('SELECT id, user_id, amount, currency, status FROM transactions WHERE id = ?')
    .bind(transaction_id)
    .first<{ id: number; user_id: string; amount: number; currency: string; status: string }>()

  if (!tx) return c.json({ error: 'Transaction not found' }, 404)
  if (tx.status !== 'success') return c.json({ error: 'Can only refund successful transactions' }, 400)

  // Check for existing pending refund
  const existing = await c.env.DB
    .prepare("SELECT id FROM refunds WHERE transaction_id = ? AND status = 'pending'")
    .bind(transaction_id)
    .first()
  if (existing) return c.json({ error: 'Refund request already pending for this transaction' }, 409)

  // Get user's total tool usage count (check if they used 5+ times)
  const usage = await c.env.DB
    .prepare('SELECT COALESCE(SUM(count), 0) AS total FROM usage_log WHERE user_id = ?')
    .bind(user_id)
    .first<{ total: number }>()

  const usageCount = usage?.total ?? 0

  const id = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)

  await c.env.DB.prepare(
    `INSERT INTO refunds (id, transaction_id, user_id, amount, currency, reason, usage_count, requested_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, transaction_id, user_id, amount, tx.currency, reason, usageCount, now)
    .run()

  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, target_user_id, changes, ip_address) VALUES (?, ?, ?, ?, ?)')
    .bind(c.var.userId, 'refund.created', user_id, JSON.stringify({ transaction_id, amount, reason, usage_count: usageCount }), getClientIP(c))
    .run()

  return c.json({ id, usage_count: usageCount, eligible: usageCount < 5, message: 'Refund request created' }, 201)
})

// Process refund (approve/reject)
refundsAdmin.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = processRefundSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid status update' }, 400)

  const refund = await c.env.DB
    .prepare('SELECT * FROM refunds WHERE id = ?')
    .bind(id)
    .first<{ id: string; user_id: string; status: string; usage_count: number; transaction_id: number }>()

  if (!refund) return c.json({ error: 'Refund not found' }, 404)
  if (refund.status !== 'pending') return c.json({ error: 'Refund already processed' }, 400)

  const now = Math.floor(Date.now() / 1000)
  const updated = await c.env.DB
    .prepare('UPDATE refunds SET status = ?, processed_at = ?, processed_by = ?, notes = ? WHERE id = ? RETURNING *')
    .bind(result.data.status, now, c.var.userId, result.data.notes ?? null, id)
    .first()

  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, target_user_id, changes, ip_address) VALUES (?, ?, ?, ?, ?)')
    .bind(c.var.userId, `refund.${result.data.status}`, refund.user_id, JSON.stringify({ refund_id: id, status: result.data.status, notes: result.data.notes }), getClientIP(c))
    .run()

  // Create notification
  if (result.data.status === 'approved' || result.data.status === 'rejected') {
    await c.env.DB.prepare(
      `INSERT INTO admin_notifications (id, type, title, message, severity, link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(crypto.randomUUID(), 'refund_processed', `Refund ${result.data.status}`, `Refund ${id} has been ${result.data.status}`, 'info', `/admin/refunds`, now)
      .run()
  }

  return c.json({ refund: updated })
})

export default refundsAdmin
