import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { getClientIP } from '../../lib/rate-limit'
import type { Bindings } from '../../types'

const subscriptionsAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
subscriptionsAdmin.use('*', adminMiddleware)

const updateSubscriptionSchema = z.object({
  action: z.enum(['extend', 'cancel', 'downgrade', 'reactivate']),
  days: z.number().int().min(1).max(365).optional(),
  reason: z.string().max(500).optional(),
})

// List active pro subscriptions
subscriptionsAdmin.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const filter = c.req.query('filter') ?? 'active' // active | expiring | cancelled | grace
  const search = c.req.query('search')?.trim() ?? ''
  const offset = (page - 1) * limit
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysFromNow = now + 30 * 86400

  const filters: string[] = ["plan = 'pro'"]
  const values: unknown[] = []

  if (search) {
    filters.push('email LIKE ?')
    values.push(`%${search}%`)
  }

  if (filter === 'expiring') {
    filters.push('pro_expires_at IS NOT NULL', 'pro_expires_at <= ?', 'pro_expires_at > ?')
    values.push(thirtyDaysFromNow, now)
  } else if (filter === 'cancelled') {
    filters.push('cancel_at_period_end = 1')
  } else if (filter === 'grace') {
    filters.push('grace_until IS NOT NULL', 'grace_until > ?')
    values.push(now)
  } else {
    // active
    filters.push('cancel_at_period_end = 0', 'deleted_at IS NULL')
  }

  const where = `WHERE ${filters.join(' AND ')}`

  const [rows, total] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, email, plan, pro_tier, pro_expires_at, cancel_at_period_end, grace_until, created_at, last_login,
        (SELECT COALESCE(SUM(credits_total - credits_used), 0) FROM credit_packs cp WHERE cp.user_id = users.id AND cp.pack_type = 'cv-10' AND cp.credits_used < cp.credits_total) AS cv_credits,
        (SELECT COALESCE(SUM(credits_total - credits_used), 0) FROM credit_packs cp WHERE cp.user_id = users.id AND cp.pack_type = 'social-50' AND cp.credits_used < cp.credits_total) AS social_credits
       FROM users ${where}
       ORDER BY pro_expires_at ASC
       LIMIT ? OFFSET ?`
    )
      .bind(...values, limit, offset)
      .all(),
    c.env.DB.prepare(`SELECT COUNT(*) AS count FROM users ${where}`)
      .bind(...values)
      .first<{ count: number }>(),
  ])

  return c.json({ page, limit, total: total?.count ?? 0, subscriptions: rows.results ?? [] })
})

// Get summary counts
subscriptionsAdmin.get('/summary', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysFromNow = now + 30 * 86400

  const [active, expiring, cancelled, grace] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND cancel_at_period_end = 0 AND deleted_at IS NULL").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND pro_expires_at <= ? AND pro_expires_at > ?").bind(thirtyDaysFromNow, now).first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND cancel_at_period_end = 1").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE grace_until IS NOT NULL AND grace_until > ?").bind(now).first<{ count: number }>(),
  ])

  return c.json({
    active: active?.count ?? 0,
    expiring_soon: expiring?.count ?? 0,
    cancelled: cancelled?.count ?? 0,
    in_grace: grace?.count ?? 0,
  })
})

// Update subscription
subscriptionsAdmin.patch('/:userId', async (c) => {
  const userId = c.req.param('userId')
  const body = await c.req.json().catch(() => null)
  const result = updateSubscriptionSchema.safeParse(body)

  if (!result.success) {
    return c.json({ error: 'Invalid update', details: result.error.issues }, 400)
  }

  const user = await c.env.DB
    .prepare('SELECT id, email, plan, pro_expires_at, cancel_at_period_end FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string; plan: string; pro_expires_at: number | null; cancel_at_period_end: number }>()

  if (!user) return c.json({ error: 'User not found' }, 404)

  const now = Math.floor(Date.now() / 1000)
  const { action, days } = result.data
  let updated: unknown

  if (action === 'extend') {
    const base = user.pro_expires_at && user.pro_expires_at > now ? user.pro_expires_at : now
    const newExpiry = base + (days ?? 30) * 86400
    updated = await c.env.DB
      .prepare("UPDATE users SET plan = 'pro', pro_expires_at = ?, cancel_at_period_end = 0, grace_until = NULL WHERE id = ? RETURNING id, email, plan, pro_expires_at, cancel_at_period_end")
      .bind(newExpiry, userId)
      .first()

    // Log subscription event
    await c.env.DB.prepare('INSERT INTO subscription_events (id, user_id, event_type, plan, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, 'extended', 'pro', JSON.stringify({ days, new_expiry: newExpiry, admin_id: c.var.userId, reason: result.data.reason }), now)
      .run()
  } else if (action === 'cancel') {
    updated = await c.env.DB
      .prepare('UPDATE users SET cancel_at_period_end = 1 WHERE id = ? RETURNING id, email, plan, pro_expires_at, cancel_at_period_end')
      .bind(userId)
      .first()
    await c.env.DB.prepare('INSERT INTO subscription_events (id, user_id, event_type, plan, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, 'cancelled', 'pro', JSON.stringify({ admin_id: c.var.userId, reason: result.data.reason }), now)
      .run()
  } else if (action === 'downgrade') {
    updated = await c.env.DB
      .prepare("UPDATE users SET plan = 'free', pro_expires_at = NULL, cancel_at_period_end = 0, grace_until = NULL WHERE id = ? RETURNING id, email, plan, pro_expires_at, cancel_at_period_end")
      .bind(userId)
      .first()
    await c.env.DB.prepare('INSERT INTO subscription_events (id, user_id, event_type, plan, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, 'downgraded', 'pro', JSON.stringify({ admin_id: c.var.userId, reason: result.data.reason }), now)
      .run()
  } else if (action === 'reactivate') {
    updated = await c.env.DB
      .prepare('UPDATE users SET cancel_at_period_end = 0 WHERE id = ? RETURNING id, email, plan, pro_expires_at, cancel_at_period_end')
      .bind(userId)
      .first()
    await c.env.DB.prepare('INSERT INTO subscription_events (id, user_id, event_type, plan, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, 'reactivated', 'pro', JSON.stringify({ admin_id: c.var.userId }), now)
      .run()
  }

  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, target_user_id, changes, ip_address) VALUES (?, ?, ?, ?, ?)')
    .bind(c.var.userId, `subscription.${action}`, userId, JSON.stringify(result.data), getClientIP(c))
    .run()

  return c.json({ user: updated })
})

export default subscriptionsAdmin
