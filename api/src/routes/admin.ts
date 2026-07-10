import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../middleware/admin'
import bugReportsAdmin from './admin/bug-reports'
import subscriptionsAdmin from './admin/subscriptions'
import refundsAdmin from './admin/refunds'
import analyticsAdmin from './admin/analytics'
import systemAdmin from './admin/system'
import { contentAdmin } from './admin/content'
import auditAdmin from './admin/audit'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import { PRICING } from '../lib/pricing'
import type { Bindings } from '../types'

const admin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
admin.use('*', adminMiddleware)
admin.use('*', async (c, next) => {
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `admin:${c.var.userId}:${ip}`, 60, 60)
  if (!limit.allowed) return c.json({ error: 'Too many admin requests', reset_at: limit.resetAt }, 429)
  await next()
})

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
  pro_tier: z.enum(['starter', 'pro', 'business']).nullable().optional(),
  pro_expires_at: z.number().int().nullable().optional(),
  status: z.enum(['active', 'banned']).optional(),
})

const grantCreditsSchema = z.object({
  pack_type: z.enum(['cv-10', 'social-50']),
  credits: z.number().int().min(1).max(1000),
})

admin.get('/stats', async (c) => {
  try {
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
      c.env.DB.prepare(`SELECT COUNT(*) AS count FROM users WHERE date(created_at, 'unixepoch') = ?`)
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
      c.env.DB.prepare("SELECT date, tool_id, SUM(count) AS count FROM usage_log WHERE date >= ? GROUP BY date, tool_id ORDER BY date ASC")
        .bind(since7)
        .all<{ date: string; tool_id: string; count: number }>(),
      c.env.DB.prepare("SELECT date(created_at, 'unixepoch') AS date, COUNT(*) AS count FROM users WHERE created_at >= ? GROUP BY date ORDER BY date ASC")
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
  } catch (err) {
    console.error('admin stats error:', err)
    return c.json({
      total_users: 0,
      users_today: 0,
      pro_users: 0,
      free_users: 0,
      revenue_this_month: 0,
      top_tools: [],
      limit_hits_today: [],
      daily_tool_usage: [],
      daily_signups: [],
    })
  }
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
    `SELECT u.id, u.email, u.plan, u.pro_tier, u.role, u.status, u.pro_expires_at, u.created_at, u.last_login,
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
    `SELECT u.id, u.email, u.plan, u.pro_tier, u.role, u.status, u.pro_expires_at, u.created_at, u.last_login,
      COALESCE(SUM(l.count), 0) AS total_tool_uses
     FROM users u
     LEFT JOIN usage_log l ON l.user_id = u.id
     WHERE u.id = ?
     GROUP BY u.id`
  ).bind(id).first()

  if (!user) return c.json({ error: 'User not found' }, 404)

  const credits = await c.env.DB.prepare(
    `SELECT pack_type, SUM(credits_total - credits_used) AS remaining
     FROM credit_packs
     WHERE user_id = ? AND credits_used < credits_total
     GROUP BY pack_type`
  ).bind(id).all<{ pack_type: string; remaining: number }>()

  const since = dayOffset(29)
  const [transactions, usage] = await Promise.all([
    c.env.DB.prepare('SELECT id, amount, currency, plan_type, status, midtrans_order_id, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC')
      .bind(id)
      .all(),
    c.env.DB.prepare('SELECT date, tool_id, count, limit_hits FROM usage_log WHERE user_id = ? AND date >= ? ORDER BY date DESC, tool_id ASC')
      .bind(id, since)
      .all(),
  ])

  return c.json({ user, transactions: transactions.results ?? [], usage_log: usage.results ?? [], credits: credits.results ?? [] })
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
    .prepare('SELECT id, email, plan, pro_tier, role, status, pro_expires_at FROM users WHERE id = ?')
    .bind(id)
    .first()

  const updated = await c.env.DB.prepare(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ? RETURNING id, email, plan, pro_tier, role, status, pro_expires_at, created_at, last_login`
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

// Manually grant a credit pack to a user (comp, support, migration).
admin.post('/users/:id/grant-credits', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = grantCreditsSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid grant' }, 400)

  const { pack_type, credits } = result.data
  if (!(pack_type in PRICING.packs)) return c.json({ error: 'Unknown pack type' }, 400)

  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(id).first<{ id: string; email: string }>()
  if (!user) return c.json({ error: 'User not found' }, 404)

  const pack = await c.env.DB
    .prepare('INSERT INTO credit_packs (user_id, pack_type, credits_total) VALUES (?, ?, ?) RETURNING id, pack_type, credits_total, credits_used, purchased_at')
    .bind(id, pack_type, credits)
    .first()

  await c.env.DB
    .prepare('INSERT INTO admin_audit_log (admin_id, action, target_user_id, changes, ip_address) VALUES (?, ?, ?, ?, ?)')
    .bind(c.var.userId, 'credits.grant', id, JSON.stringify({ pack_type, credits, email: user.email }), getClientIP(c))
    .run()

  return c.json({ pack })
})

admin.get('/transactions', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const offset = (page - 1) * limit
  const search = c.req.query('search')?.trim() ?? ''

  const SORT_COLUMNS: Record<string, string> = { amount: 't.amount', created_at: 't.created_at', status: 't.status' }
  const DIRS: Record<string, string> = { asc: 'ASC', desc: 'DESC' }
  const sort = c.req.query('sort') ?? 'created_at'
  const direction = c.req.query('direction') ?? 'desc'
  const safeSort = SORT_COLUMNS[sort] ?? 'created_at'
  const safeDir = DIRS[direction] ?? 'DESC'

  const where = search ? 'WHERE u.email LIKE ? OR t.midtrans_order_id LIKE ?' : ''
  const values = search ? [`%${search}%`, `%${search}%`] : []

  const rows = await c.env.DB.prepare(
    `SELECT t.id, u.email AS user_email, t.amount, t.currency, t.plan_type, t.status, t.midtrans_order_id, t.created_at
     FROM transactions t
     LEFT JOIN users u ON u.id = t.user_id
     ${where}
     ORDER BY ${safeSort} ${safeDir}
     LIMIT ? OFFSET ?`
  ).bind(...values, limit, offset).all()
  const total = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM transactions t LEFT JOIN users u ON u.id = t.user_id ${where}`
  ).bind(...values).first<{ count: number }>()

  return c.json({ page, limit, total: total?.count ?? 0, transactions: rows.results ?? [] })
})

admin.get('/errors', async (c) => {
  const rows = await c.env.DB.prepare('SELECT id, tool_id, error_type, user_agent, plan, created_at FROM error_log ORDER BY created_at DESC LIMIT 100').all()
  const groups = await c.env.DB.prepare(
    'SELECT tool_id, error_type, COUNT(*) AS count FROM error_log GROUP BY tool_id, error_type ORDER BY count DESC'
  ).all()
  return c.json({ errors: rows.results ?? [], groups: groups.results ?? [] })
})

admin.post('/cron/run', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60

  const expiredGrace = await c.env.DB
    .prepare('SELECT id FROM users WHERE plan = ? AND grace_until IS NOT NULL AND grace_until < ?')
    .bind('pro', now)
    .all<{ id: string }>()

  for (const user of expiredGrace.results ?? []) {
    await c.env.DB
      .prepare('UPDATE users SET plan = ?, pro_expires_at = NULL, grace_until = NULL, cancel_at_period_end = 0 WHERE id = ?')
      .bind('free', user.id)
      .run()
  }

  const deleted = await c.env.DB
    .prepare('SELECT id FROM users WHERE deleted_at IS NOT NULL AND deleted_at < ?')
    .bind(thirtyDaysAgo)
    .all<{ id: string }>()

  for (const user of deleted.results ?? []) {
    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run()
  }

  await c.env.DB.prepare('DELETE FROM password_resets WHERE expires_at < ? OR used = 1').bind(now).run()
  await c.env.DB.prepare('DELETE FROM email_verifications WHERE expires_at < ? OR used = 1').bind(now).run()
  await c.env.DB.prepare('DELETE FROM rate_limit WHERE window_start < ?').bind(now - 3600).run()
  await c.env.DB.prepare('DELETE FROM failed_logins WHERE attempted_at < ?').bind(now - 24 * 60 * 60).run()
  await c.env.DB.prepare('DELETE FROM anonymous_usage WHERE created_at < ?').bind(now - 7 * 24 * 60 * 60).run()

  return c.json({ ok: true, downgraded: expiredGrace.results?.length ?? 0, deleted: deleted.results?.length ?? 0 })
})

admin.route('/bug-reports', bugReportsAdmin)
admin.route('/subscriptions', subscriptionsAdmin)
admin.route('/refunds', refundsAdmin)
admin.route('/analytics', analyticsAdmin)
admin.route('/system', systemAdmin)
admin.route('/content', contentAdmin)
admin.route('/audit', auditAdmin)

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
