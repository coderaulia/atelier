import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { authMiddleware, type AuthVariables } from '../../middleware/auth'
import { getClientIP } from '../../lib/rate-limit'
import type { Bindings } from '../../types'

const contentAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
const contentPublic = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

contentAdmin.use('*', adminMiddleware)
contentPublic.use('*', authMiddleware)

const announcementSchema = z.object({
  title: z.string().min(3).max(120),
  message: z.string().min(5).max(1000),
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  target: z.enum(['all', 'free', 'pro']).default('all'),
  is_active: z.boolean().default(true),
  start_at: z.number().int().nullable().optional(),
  end_at: z.number().int().nullable().optional(),
})

const templateSchema = z.object({
  subject: z.string().min(1).max(200),
  html_body: z.string().min(10).max(20000),
})

// User-facing active announcements
contentPublic.get('/announcements', async (c) => {
  const plan = c.var.plan
  const now = Math.floor(Date.now() / 1000)
  const rows = await c.env.DB.prepare(
    `SELECT id, title, message, type, target, start_at, end_at
     FROM announcements
     WHERE is_active = 1
       AND target IN ('all', ?)
       AND (start_at IS NULL OR start_at <= ?)
       AND (end_at IS NULL OR end_at >= ?)
     ORDER BY created_at DESC
     LIMIT 5`
  ).bind(plan, now, now).all()
  return c.json({ announcements: rows.results ?? [] })
})

// Admin announcements CRUD
contentAdmin.get('/announcements', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 100'
  ).all()
  return c.json({ announcements: rows.results ?? [] })
})

contentAdmin.post('/announcements', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = announcementSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid announcement', details: result.error.issues }, 400)

  const id = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)
  const data = result.data

  await c.env.DB.prepare(
    `INSERT INTO announcements (id, title, message, type, target, is_active, start_at, end_at, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, data.title, data.message, data.type, data.target, data.is_active ? 1 : 0, data.start_at ?? null, data.end_at ?? null, c.var.userId, now, now).run()

  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, changes, ip_address) VALUES (?, ?, ?, ?)')
    .bind(c.var.userId, 'announcement.create', JSON.stringify({ id, ...data }), getClientIP(c)).run()

  return c.json({ id, message: 'Announcement created' }, 201)
})

contentAdmin.patch('/announcements/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = announcementSchema.partial().safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid announcement update' }, 400)

  const existing = await c.env.DB.prepare('SELECT id FROM announcements WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Announcement not found' }, 404)

  const data = result.data
  const fields: string[] = ['updated_at = ?']
  const values: unknown[] = [Math.floor(Date.now() / 1000)]
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`)
    values.push(typeof value === 'boolean' ? (value ? 1 : 0) : value)
  }
  const updated = await c.env.DB.prepare(`UPDATE announcements SET ${fields.join(', ')} WHERE id = ? RETURNING *`).bind(...values, id).first()
  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, changes, ip_address) VALUES (?, ?, ?, ?)')
    .bind(c.var.userId, 'announcement.update', JSON.stringify({ id, ...data }), getClientIP(c)).run()
  return c.json({ announcement: updated })
})

contentAdmin.delete('/announcements/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()
  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, changes, ip_address) VALUES (?, ?, ?, ?)')
    .bind(c.var.userId, 'announcement.delete', JSON.stringify({ id }), getClientIP(c)).run()
  return c.json({ ok: true })
})

// Email template overrides
contentAdmin.get('/email-templates', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM email_template_overrides ORDER BY template_key ASC').all()
  return c.json({ templates: rows.results ?? [] })
})

contentAdmin.put('/email-templates/:key', async (c) => {
  const key = c.req.param('key')
  const body = await c.req.json().catch(() => null)
  const result = templateSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid email template' }, 400)
  const now = Math.floor(Date.now() / 1000)
  await c.env.DB.prepare(
    `INSERT INTO email_template_overrides (template_key, subject, html_body, updated_by, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(template_key) DO UPDATE SET subject = ?, html_body = ?, updated_by = ?, updated_at = ?`
  ).bind(key, result.data.subject, result.data.html_body, c.var.userId, now, result.data.subject, result.data.html_body, c.var.userId, now).run()
  return c.json({ ok: true })
})

export { contentAdmin, contentPublic }
