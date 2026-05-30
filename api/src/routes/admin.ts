import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../middleware/admin'
import bugReportsAdmin from './admin/bug-reports'
import subscriptionsAdmin from './admin/subscriptions'
import refundsAdmin from './admin/refunds'
import analyticsAdmin from './admin/analytics'
import systemAdmin from './admin/system'
import { getClientIP } from '../lib/rate-limit'
import type { Bindings } from '../types'

const admin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
admin.use('*', adminMiddleware)

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function monthStartUnix(): number {
  const d = new Date()
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 1000)
}

function dayOffset(daysAgo: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

const patchUserSchema = z.object({
  plan: z.enum(['free', 'pro']).optional(),
  pro_expires_at: z.number().int().nullable().optional(),
  status: z.enum(['active', 'banned']).optional(),
})

admin.get('/stats', async (c) => {
  const today = todayUTC()
  const monthStart = monthStartUnix()
  const since7 = dayOffset(6)
  const since30Unix = Math.floor(Date.now() / 1000) - 30 * 86400

  const [totals, usersToday, revenue, topTools, limitHits, dailyTools, dailySignups] = await Promise.all([
    c.env.DB.prepare(
      `SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN plan = 'pro' THEN 1 ELSE 0 END) AS pro_users,
        SUM(CASE WHEN plan = 'free' THEN 1 ELSE 0 END) AS free_users
       FROM users`
    ).first<{ total_users: number; pro_users: number; free_users: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM users WHERE date(created_at, \"unixepoch\") = ?')
      .bind(today)
      .first<{ count: number }>(),
    c.env.DB.prepare('SELECT COALESCE(SUM(amount), 0) AS revenue FROM transactions WHERE status = ? AND created_at >= ?')
      .bind('success', monthStart)
      .first<{ revenue: number }>(),
    c.env.DB.prepare('SELECT tool_id, SUM(count) AS count FROM usage_log GROUP BY tool_id ORDER BY count DESC LIMIT 5')
      .all<{ tool_id: string; count: number }>(),
    c.env.DB.prepare('SELECT tool_id, SUM(limit_hits) AS count FROM usage_log WHERE date = ? GROUP BY tool_id ORDER BY count DESC')
      .bind(today)
      .all<{ tool_id: string; count: number }>(),
    c.env.DB.prepare('SELECT date, tool_id, SUM(count) AS count FROM usage_log WHERE date >= ? GROUP BY date, tool_id ORDER BY date ASC')
      .bind(since7)
      .all<{ date: string; tool_id: string; count: number }>(),
    c.env.DB.prepare('SELECT date(created_at, \"unixepoch\") AS date, COUNT(*) AS count FROM users WHERE created_at >= ? GROUP BY date ORDER BY date ASC')
      .bind(since30Unix)
      .all<{ date: string; count: number }>(),
  ])

  return c.json({
    total_users: totals?.total_users ?? 0,
    users_today: usersToday?.count ?? 0,
    pro_users: totals?.pro_users ?? 0,
    free_users: totals?.free_users ?? 0,
    revenue_this_month: revenue?.revenue ?? 0,
    top_tools: topTools.results ?? [],
    limit_hits_today: limitHits.results ?? [],
    daily_tool_usage: dailyTools.results ?? [],
    daily_signups: dailySignups.results ?? [],
  })
})

admin.get('/users', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const search = c.req.query('search')?.trim() ?? ''
  const plan = c.req.query('plan')
  const offset = (page - 1) * limit
  const filters: string[] = []
  const values: unknown[] = []

  if (search) {
    filters.push('email LIKE ?')
    values.push(`%${search}%`)
  }
  if (plan === 'free' || plan === 'pro') {
    filters.push('plan = ?')
    values.push(plan)
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const rows = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.plan, u.role, u.status, u.pro_expires_at, u.created_at, u.last_login,
      COALESCE(SUM(l.count), 0) AS total_tool_uses
     FROM users u
     LEFT JOIN usage_log l ON l.user_id = u.id
     ${where}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...values, limit, offset).all()

  const total = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM users ${where}`)
    .bind(...values)
    .first<{ count: number }>()

  return c.json({ page, limit, total: total?.count ?? 0, users: rows.results ?? [] })
})

admin.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  const user = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.plan, u.role, u.status, u.pro_expires_at, u.created_at, u.last_login,
      COALESCE(SUM(l.count), 0) AS total_tool_uses
     FROM users u
     LEFT JOIN usage_log l ON l.user_id = u.id
     WHERE u.id = ?
     GROUP BY u.id`
  ).bind(id).first()

  if (!user) return c.json({ error: 'User not found' }, 404)

  const since = dayOffset(29)
  const [transactions, usage] = await Promise.all([
    c.env.DB.prepare('SELECT id, amount, currency, plan_type, status, midtrans_order_id, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC')
      .bind(id)
      .all(),
    c.env.DB.prepare('SELECT date, tool_id, count, limit_hits FROM usage_log WHERE user_id = ? AND date >= ? ORDER BY date DESC, tool_id ASC')
      .bind(id, since)
      .all(),
  ])

  return c.json({ user, transactions: transactions.results ?? [], usage_log: usage.results ?? [] })
})

admin.patch('/users/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = patchUserSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid user update' }, 400)

  const fields: string[] = []
  const values: unknown[] = []
  for (const [key, value] of Object.entries(result.data)) {
    fields.push(`${key} = ?`)
    values.push(value)
  }
  if (!fields.length) return c.json({ error: 'No changes provided' }, 400)

  const before = await c.env.DB
    .prepare('SELECT id, email, plan, role, status, pro_expires_at FROM users WHERE id = ?')
    .bind(id)
    .first()

  const updated = await c.env.DB.prepare(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ? RETURNING id, email, plan, role, status, pro_expires_at, created_at, last_login`
  ).bind(...values, id).first()

  if (!updated) return c.json({ error: 'User not found' }, 404)

  await c.env.DB
    .prepare('INSERT INTO admin_audit_log (admin_id, action, target_user_id, changes, ip_address) VALUES (?, ?, ?, ?, ?)')
    .bind(
      c.var.userId,
      'user.update',
      id,
      JSON.stringify({ before, after: updated, patch: result.data }),
      getClientIP(c)
    )
    .run()

  return c.json({ user: updated })
})

admin.get('/transactions', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const offset = (page - 1) * limit

  const SORT_COLUMNS: Record<string, string> = { amount: 'amount', created_at: 'created_at', status: 'status' }
  const DIRS: Record<string, string> = { asc: 'ASC', desc: 'DESC' }
  const sort = c.req.query('sort') ?? 'created_at'
  const direction = c.req.query('direction') ?? 'desc'
  const safeSort = SORT_COLUMNS[sort] ?? 'created_at'
  const safeDir = DIRS[direction] ?? 'DESC'

  const rows = await c.env.DB.prepare(
    `SELECT t.id, u.email AS user_email, t.amount, t.currency, t.plan_type, t.status, t.midtrans_order_id, t.created_at
     FROM transactions t
     LEFT JOIN users u ON u.id = t.user_id
     ORDER BY ${safeSort} ${safeDir}
     LIMIT ? OFFSET ?`
  ).bind(limit, offset).all()
  const total = await c.env.DB.prepare('SELECT COUNT(*) AS count FROM transactions').first<{ count: number }>()

  return c.json({ page, limit, total: total?.count ?? 0, transactions: rows.results ?? [] })
})

admin.get('/errors', async (c) => {
  const rows = await c.env.DB.prepare('SELECT id, tool_id, error_type, user_agent, plan, created_at FROM error_log ORDER BY created_at DESC LIMIT 100').all()
  const groups = await c.env.DB.prepare(
    'SELECT tool_id, error_type, COUNT(*) AS count FROM error_log GROUP BY tool_id, error_type ORDER BY count DESC'
  ).all()
  return c.json({ errors: rows.results ?? [], groups: groups.results ?? [] })
})

admin.route('/bug-reports', bugReportsAdmin)
admin.route('/subscriptions', subscriptionsAdmin)
admin.route('/refunds', refundsAdmin)
admin.route('/analytics', analyticsAdmin)
admin.route('/system', systemAdmin)

// ── Notifications ─────────────────────────────────────────────────

admin.get('/notifications', async (c) => {
  const unreadOnly = c.req.query('unread') === '1'
  const where = unreadOnly ? 'WHERE is_read = 0' : ''

  const [rows, unread] = await Promise.all([
    c.env.DB.prepare(`SELECT * FROM admin_notifications ${where} ORDER BY created_at DESC LIMIT 50`).all(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM admin_notifications WHERE is_read = 0').first<{ count: number }>(),
  ])

  return c.json({ notifications: rows.results ?? [], unread_count: unread?.count ?? 0 })
})

admin.patch('/notifications/:id/read', async (c) => {
  const id = c.req.param('id')
  await c.env.DB
    .prepare('UPDATE admin_notifications SET is_read = 1, read_at = ? WHERE id = ?')
    .bind(Math.floor(Date.now() / 1000), id)
    .run()
  return c.json({ ok: true })
})

admin.patch('/notifications/read-all', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  await c.env.DB
    .prepare('UPDATE admin_notifications SET is_read = 1, read_at = ? WHERE is_read = 0')
    .bind(now)
    .run()
  return c.json({ ok: true })
})

export default admin
