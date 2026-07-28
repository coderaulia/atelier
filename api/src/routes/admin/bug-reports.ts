import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { getClientIP } from '../../lib/rate-limit'
import type { Bindings } from '../../types'

const bugReportsAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
bugReportsAdmin.use('*', adminMiddleware)

const updateBugReportSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['new', 'in_progress', 'resolved', 'closed', 'wont_fix']).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  assigned_to: z.string().nullable().optional(),
  resolution_notes: z.string().optional(),
  version: z.number().int().min(1),
})

const createCommentSchema = z.object({
  comment: z.string().min(1).max(2000),
  is_internal: z.boolean().default(false),
})

// List bug reports with filters
bugReportsAdmin.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 50)))
  const status = c.req.query('status')
  const severity = c.req.query('severity')
  const tool_id = c.req.query('tool_id')
  const offset = (page - 1) * limit

  const filters: string[] = []
  const values: unknown[] = []

  if (status && ['new', 'in_progress', 'resolved', 'closed', 'wont_fix'].includes(status)) {
    filters.push('status = ?')
    values.push(status)
  }
  if (severity && ['low', 'medium', 'high', 'critical'].includes(severity)) {
    filters.push('severity = ?')
    values.push(severity)
  }
  if (tool_id) {
    filters.push('tool_id = ?')
    values.push(tool_id)
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const rows = await c.env.DB.prepare(
    `SELECT id, user_id, email, subject, tool_id, severity, status, priority, assigned_to, created_at, updated_at
     FROM bug_reports
     ${where}
     ORDER BY priority DESC, created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(...values, limit, offset)
    .all()

  const total = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM bug_reports ${where}`)
    .bind(...values)
    .first<{ count: number }>()

  return c.json({ page, limit, total: total?.count ?? 0, bug_reports: rows.results ?? [] })
})

// Get single bug report with comments
bugReportsAdmin.get('/:id', async (c) => {
  const id = c.req.param('id')

  const report = await c.env.DB.prepare(
    `SELECT * FROM bug_reports WHERE id = ?`
  )
    .bind(id)
    .first()

  if (!report) {
    return c.json({ error: 'Bug report not found' }, 404)
  }

  const comments = await c.env.DB.prepare(
    `SELECT c.*, u.email AS user_email
     FROM bug_report_comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.bug_report_id = ?
     ORDER BY c.created_at ASC
     LIMIT 200`
  )
    .bind(id)
    .all()

  return c.json({ bug_report: report, comments: comments.results ?? [] })
})

// Update bug report
bugReportsAdmin.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = updateBugReportSchema.safeParse(body)

  if (!result.success) {
    return c.json({ error: 'Invalid update data', details: result.error.issues }, 400)
  }

  const before = await c.env.DB.prepare('SELECT * FROM bug_reports WHERE id = ?').bind(id).first()
  if (!before) {
    return c.json({ error: 'Bug report not found' }, 404)
  }

  const fields: string[] = ['updated_at = ?', 'version = version + 1']
  const values: unknown[] = [Math.floor(Date.now() / 1000)]

  for (const [key, value] of Object.entries(result.data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  }

  // If status changed to resolved, set resolved_at and resolved_by
  if (result.data.status === 'resolved' && before.status !== 'resolved') {
    fields.push('resolved_at = ?', 'resolved_by = ?')
    values.push(Math.floor(Date.now() / 1000), c.var.userId)
  }

  const updated = await c.env.DB.prepare(
    `UPDATE bug_reports SET ${fields.join(', ')} WHERE id = ? AND version = ? RETURNING *`
  )
    .bind(...values, id, result.data.version)
    .first()
  if (!updated) return c.json({ error: 'Bug report changed by another admin; refresh and retry' }, 409)

  // Audit log
  await c.env.DB.prepare(
    'INSERT INTO admin_audit_log (admin_id, action, target_user_id, changes, ip_address) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(
      c.var.userId,
      'bug_report.update',
      before.user_id,
      JSON.stringify({ before, after: updated, patch: result.data }),
      getClientIP(c)
    )
    .run()

  return c.json({ bug_report: updated })
})

// Add comment to bug report
bugReportsAdmin.post('/:id/comments', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = createCommentSchema.safeParse(body)

  if (!result.success) {
    return c.json({ error: 'Invalid comment data', details: result.error.issues }, 400)
  }

  const report = await c.env.DB.prepare('SELECT id FROM bug_reports WHERE id = ?').bind(id).first()
  if (!report) {
    return c.json({ error: 'Bug report not found' }, 404)
  }

  const commentId = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)

  await c.env.DB.prepare(
    `INSERT INTO bug_report_comments (id, bug_report_id, user_id, comment, is_internal, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(commentId, id, c.var.userId, result.data.comment, result.data.is_internal ? 1 : 0, now)
    .run()

  // Update bug report updated_at
  await c.env.DB.prepare('UPDATE bug_reports SET updated_at = ?, version = version + 1 WHERE id = ?').bind(now, id).run()

  return c.json({ id: commentId, message: 'Comment added' }, 201)
})

// Get bug report statistics
bugReportsAdmin.get('/stats/summary', async (c) => {
  const [statusCounts, severityCounts, toolCounts] = await Promise.all([
    c.env.DB.prepare(
      'SELECT status, COUNT(*) AS count FROM bug_reports GROUP BY status'
    ).all<{ status: string; count: number }>(),
    c.env.DB.prepare(
      'SELECT severity, COUNT(*) AS count FROM bug_reports GROUP BY severity'
    ).all<{ severity: string; count: number }>(),
    c.env.DB.prepare(
      'SELECT tool_id, COUNT(*) AS count FROM bug_reports WHERE tool_id IS NOT NULL GROUP BY tool_id ORDER BY count DESC LIMIT 10'
    ).all<{ tool_id: string; count: number }>(),
  ])

  return c.json({
    by_status: statusCounts.results ?? [],
    by_severity: severityCounts.results ?? [],
    by_tool: toolCounts.results ?? [],
  })
})

export default bugReportsAdmin
