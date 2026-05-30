import { Hono } from 'hono'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import type { Bindings } from '../../types'

const auditAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
auditAdmin.use('*', adminMiddleware)

auditAdmin.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const action = c.req.query('action')
  const adminId = c.req.query('admin_id')
  const targetUserId = c.req.query('target_user_id')
  const offset = (page - 1) * limit

  const filters: string[] = []
  const values: unknown[] = []

  if (action) {
    filters.push('a.action LIKE ?')
    values.push(`${action}%`)
  }
  if (adminId) {
    filters.push('a.admin_id = ?')
    values.push(adminId)
  }
  if (targetUserId) {
    filters.push('a.target_user_id = ?')
    values.push(targetUserId)
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const rows = await c.env.DB.prepare(
    `SELECT a.id, a.admin_id, admin.email AS admin_email,
            a.action, a.target_user_id, target.email AS target_email,
            a.changes, a.ip_address, a.created_at
     FROM admin_audit_log a
     LEFT JOIN users admin ON admin.id = a.admin_id
     LEFT JOIN users target ON target.id = a.target_user_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...values, limit, offset).all()

  const total = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM admin_audit_log a ${where}`)
    .bind(...values)
    .first<{ count: number }>()

  return c.json({ page, limit, total: total?.count ?? 0, logs: rows.results ?? [] })
})

auditAdmin.get('/actions', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT action, COUNT(*) AS count FROM admin_audit_log GROUP BY action ORDER BY count DESC LIMIT 100'
  ).all()
  return c.json({ actions: rows.results ?? [] })
})

export default auditAdmin
