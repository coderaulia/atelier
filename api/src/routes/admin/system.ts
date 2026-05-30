import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { getClientIP } from '../../lib/rate-limit'
import type { Bindings } from '../../types'

const systemAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
systemAdmin.use('*', adminMiddleware)

const updateConfigSchema = z.object({
  value: z.string().max(5000),
})

const updateFeatureFlagSchema = z.object({
  enabled: z.boolean().optional(),
  rollout_percentage: z.number().int().min(0).max(100).optional(),
  user_whitelist: z.array(z.string()).optional(),
})

// ── System Configuration ──────────────────────────────────────────

systemAdmin.get('/config', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT key, value, type, description, updated_at FROM system_config ORDER BY key ASC'
  ).all()
  return c.json({ config: rows.results ?? [] })
})

systemAdmin.patch('/config/:key', async (c) => {
  const key = c.req.param('key')
  const body = await c.req.json().catch(() => null)
  const result = updateConfigSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid value' }, 400)

  const existing = await c.env.DB.prepare('SELECT key, type FROM system_config WHERE key = ?').bind(key).first<{ key: string; type: string }>()
  if (!existing) return c.json({ error: 'Config key not found' }, 404)

  const now = Math.floor(Date.now() / 1000)
  const updated = await c.env.DB.prepare(
    'UPDATE system_config SET value = ?, updated_at = ?, updated_by = ? WHERE key = ? RETURNING *'
  )
    .bind(result.data.value, now, c.var.userId, key)
    .first()

  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, changes, ip_address) VALUES (?, ?, ?, ?)')
    .bind(c.var.userId, 'config.update', JSON.stringify({ key, value: result.data.value }), getClientIP(c))
    .run()

  return c.json({ config: updated })
})

// ── Feature Flags ─────────────────────────────────────────────────

systemAdmin.get('/features', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT key, enabled, description, rollout_percentage, user_whitelist, created_at, updated_at FROM feature_flags ORDER BY key ASC'
  ).all()
  return c.json({ features: rows.results ?? [] })
})

systemAdmin.patch('/features/:key', async (c) => {
  const key = c.req.param('key')
  const body = await c.req.json().catch(() => null)
  const result = updateFeatureFlagSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid update' }, 400)

  const existing = await c.env.DB.prepare('SELECT key FROM feature_flags WHERE key = ?').bind(key).first()
  if (!existing) return c.json({ error: 'Feature flag not found' }, 404)

  const fields: string[] = ['updated_at = ?', 'updated_by = ?']
  const values: unknown[] = [Math.floor(Date.now() / 1000), c.var.userId]

  if (result.data.enabled !== undefined) {
    fields.push('enabled = ?')
    values.push(result.data.enabled ? 1 : 0)
  }
  if (result.data.rollout_percentage !== undefined) {
    fields.push('rollout_percentage = ?')
    values.push(result.data.rollout_percentage)
  }
  if (result.data.user_whitelist !== undefined) {
    fields.push('user_whitelist = ?')
    values.push(JSON.stringify(result.data.user_whitelist))
  }

  const updated = await c.env.DB.prepare(
    `UPDATE feature_flags SET ${fields.join(', ')} WHERE key = ? RETURNING *`
  )
    .bind(...values, key)
    .first()

  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, changes, ip_address) VALUES (?, ?, ?, ?)')
    .bind(c.var.userId, 'feature.update', JSON.stringify({ key, ...result.data }), getClientIP(c))
    .run()

  return c.json({ feature: updated })
})

// ── Health Monitor ────────────────────────────────────────────────

systemAdmin.get('/health', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const oneHourAgo = now - 3600

  // Check DB connectivity
  let dbStatus = 'healthy'
  try {
    await c.env.DB.prepare('SELECT 1').first()
  } catch {
    dbStatus = 'unhealthy'
  }

  // Error rate (last hour)
  const errorCount = await c.env.DB.prepare(
    'SELECT COUNT(*) AS count FROM error_log WHERE created_at >= ?'
  )
    .bind(oneHourAgo)
    .first<{ count: number }>()

  // Active sessions (last 24h)
  const activeSessions = await c.env.DB.prepare(
    'SELECT COUNT(*) AS count FROM sessions WHERE last_used >= ?'
  )
    .bind(now - 86400)
    .first<{ count: number }>()

  // Pending refunds
  const pendingRefunds = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM refunds WHERE status = 'pending'"
  ).first<{ count: number }>()

  // Unread admin notifications
  const unreadNotifications = await c.env.DB.prepare(
    'SELECT COUNT(*) AS count FROM admin_notifications WHERE is_read = 0'
  ).first<{ count: number }>()

  return c.json({
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: now,
    checks: {
      database: dbStatus,
      api: 'healthy', // If we got here, API is responding
    },
    metrics: {
      errors_last_hour: errorCount?.count ?? 0,
      active_sessions_24h: activeSessions?.count ?? 0,
      pending_refunds: pendingRefunds?.count ?? 0,
      unread_notifications: unreadNotifications?.count ?? 0,
    },
  })
})

export default systemAdmin
