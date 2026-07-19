import { Hono } from 'hono'
import { z } from 'zod'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { getClientIP } from '../../lib/rate-limit'
import { sanitizeTemplateHtml, sanitizeTemplateCss, extractTokens } from '../../lib/template-sanitize'
import type { Bindings } from '../../types'

const socialTemplatesAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
const socialTemplatesPublic = new Hono<{ Bindings: Bindings }>()

socialTemplatesAdmin.use('*', adminMiddleware)

const KINDS = ['Single', 'Carousel', 'CTA', 'News', 'Photo', 'Pricing', 'Social Proof'] as const

const fieldSchema = z.object({
  key: z.string().min(1).max(60).regex(/^[a-zA-Z0-9_]+$/, 'key must be alphanumeric/underscore'),
  label: z.string().min(1).max(120),
  type: z.enum(['text', 'textarea', 'image', 'select']).default('text'),
  placeholder: z.string().max(200).optional(),
  hint: z.string().max(300).optional(),
  options: z.array(z.object({ value: z.string().max(120), label: z.string().max(120) })).max(24).optional(),
})

const templateSchema = z.object({
  id: z.string().min(2).max(64).regex(/^[a-z0-9][a-z0-9-]*$/, 'id must be a lowercase slug'),
  name: z.string().min(2).max(80),
  kind: z.enum(KINDS).default('Single'),
  category: z.string().max(60).optional(),
  width: z.number().int().min(320).max(4096).default(1080),
  height: z.number().int().min(320).max(4096).default(1080),
  fields: z.array(fieldSchema).max(40).default([]),
  html: z.string().max(65536),
  css: z.string().max(32768).default(''),
  slides: z.array(z.string().max(65536)).max(20).optional(),
  is_pro: z.boolean().default(false),
})

const updateSchema = templateSchema.omit({ id: true }).partial()

function nowSec() {
  return Math.floor(Date.now() / 1000)
}

async function audit(c: any, action: string, changes: unknown) {
  await c.env.DB.prepare('INSERT INTO admin_audit_log (admin_id, action, changes, ip_address) VALUES (?, ?, ?, ?)')
    .bind(c.var.userId, action, JSON.stringify(changes), getClientIP(c)).run()
}

// Sanitize author input into a storable, safer form + collect warnings.
function processContent(html: string, css: string, slides?: string[]) {
  const warnings: string[] = []
  const htmlOut = sanitizeTemplateHtml(html)
  const cssOut = sanitizeTemplateCss(css)
  warnings.push(...htmlOut.removed, ...cssOut.removed)

  const cleanSlides = slides?.map((s) => {
    const r = sanitizeTemplateHtml(s)
    warnings.push(...r.removed)
    return r.clean
  })

  const { tokens, repeats } = extractTokens([html, ...(slides ?? [])].join('\n'))

  return {
    html: htmlOut.clean,
    css: cssOut.clean,
    slides: cleanSlides,
    tokens,
    repeats,
    warnings: [...new Set(warnings)],
  }
}

// ── Admin CRUD ────────────────────────────────────────────────────

socialTemplatesAdmin.get('/', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT id, name, kind, category, status, is_pro, version, width, height, updated_at, created_at
     FROM social_templates ORDER BY updated_at DESC LIMIT 200`
  ).all()
  return c.json({ templates: rows.results ?? [] })
})

socialTemplatesAdmin.get('/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM social_templates WHERE id = ?').bind(c.req.param('id')).first()
  if (!row) return c.json({ error: 'Template not found' }, 404)
  return c.json({ template: row })
})

socialTemplatesAdmin.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = templateSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid template', details: result.error.issues }, 400)
  const d = result.data

  const exists = await c.env.DB.prepare('SELECT id FROM social_templates WHERE id = ?').bind(d.id).first()
  if (exists) return c.json({ error: 'A template with that id already exists' }, 409)

  const proc = processContent(d.html, d.css, d.slides)
  const ts = nowSec()

  await c.env.DB.prepare(
    `INSERT INTO social_templates
      (id, name, kind, category, width, height, fields_json, html, css, slides_json, html_source, css_source, status, is_pro, version, created_by, updated_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, 1, ?, ?, ?, ?)`
  ).bind(
    d.id, d.name, d.kind, d.category ?? null, d.width, d.height,
    JSON.stringify(d.fields), proc.html, proc.css,
    proc.slides ? JSON.stringify(proc.slides) : null,
    d.html, d.css, d.is_pro ? 1 : 0, c.var.userId, c.var.userId, ts, ts,
  ).run()

  await audit(c, 'social_template.create', { id: d.id, name: d.name, warnings: proc.warnings })
  return c.json({ id: d.id, tokens: proc.tokens, repeats: proc.repeats, warnings: proc.warnings }, 201)
})

socialTemplatesAdmin.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const result = updateSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid update', details: result.error.issues }, 400)

  const existing = await c.env.DB.prepare('SELECT id, version FROM social_templates WHERE id = ?').bind(id).first<{ id: string; version: number }>()
  if (!existing) return c.json({ error: 'Template not found' }, 404)

  const d = result.data
  const sets: string[] = ['updated_at = ?', 'updated_by = ?', 'version = ?']
  const vals: unknown[] = [nowSec(), c.var.userId, existing.version + 1]
  let warnings: string[] = []
  let tokens: string[] = []
  let repeats: string[] = []

  const simple: Record<string, unknown> = {}
  if (d.name !== undefined) simple.name = d.name
  if (d.kind !== undefined) simple.kind = d.kind
  if (d.category !== undefined) simple.category = d.category
  if (d.width !== undefined) simple.width = d.width
  if (d.height !== undefined) simple.height = d.height
  if (d.is_pro !== undefined) simple.is_pro = d.is_pro ? 1 : 0
  if (d.fields !== undefined) simple.fields_json = JSON.stringify(d.fields)
  for (const [k, v] of Object.entries(simple)) { sets.push(`${k} = ?`); vals.push(v) }

  // Content fields trigger sanitize + source retention.
  if (d.html !== undefined || d.css !== undefined || d.slides !== undefined) {
    const proc = processContent(d.html ?? '', d.css ?? '', d.slides)
    warnings = proc.warnings; tokens = proc.tokens; repeats = proc.repeats
    if (d.html !== undefined) { sets.push('html = ?', 'html_source = ?'); vals.push(proc.html, d.html) }
    if (d.css !== undefined) { sets.push('css = ?', 'css_source = ?'); vals.push(proc.css, d.css) }
    if (d.slides !== undefined) { sets.push('slides_json = ?'); vals.push(proc.slides ? JSON.stringify(proc.slides) : null) }
  }

  await c.env.DB.prepare(`UPDATE social_templates SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run()
  await audit(c, 'social_template.update', { id, warnings })
  return c.json({ id, tokens, repeats, warnings })
})

socialTemplatesAdmin.post('/:id/publish', async (c) => {
  const id = c.req.param('id')
  const r = await c.env.DB.prepare("UPDATE social_templates SET status = 'published', updated_at = ? WHERE id = ? RETURNING id").bind(nowSec(), id).first()
  if (!r) return c.json({ error: 'Template not found' }, 404)
  await audit(c, 'social_template.publish', { id })
  return c.json({ ok: true, status: 'published' })
})

socialTemplatesAdmin.post('/:id/disable', async (c) => {
  const id = c.req.param('id')
  const r = await c.env.DB.prepare("UPDATE social_templates SET status = 'disabled', updated_at = ? WHERE id = ? RETURNING id").bind(nowSec(), id).first()
  if (!r) return c.json({ error: 'Template not found' }, 404)
  await audit(c, 'social_template.disable', { id })
  return c.json({ ok: true, status: 'disabled' })
})

socialTemplatesAdmin.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM social_templates WHERE id = ?').bind(id).run()
  await audit(c, 'social_template.delete', { id })
  return c.json({ ok: true })
})

// Parse an uploaded HTML file → detected tokens + a draft field list (no persistence).
const importSchema = z.object({ html: z.string().max(65536), css: z.string().max(32768).optional() })

socialTemplatesAdmin.post('/import', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = importSchema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid import payload' }, 400)

  const proc = processContent(result.data.html, result.data.css ?? '')
  const suggestedFields = proc.tokens.map((key) => ({
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
    type: /image|photo|logo|avatar/i.test(key) ? 'image' : 'text',
  }))

  return c.json({
    html: proc.html,
    css: proc.css,
    tokens: proc.tokens,
    repeats: proc.repeats,
    suggestedFields,
    warnings: proc.warnings,
  })
})

// ── Public feed (published only, no auth — anonymous users use the tool too) ──

socialTemplatesPublic.get('/', async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT id, name, kind, category, width, height, fields_json, html, css, slides_json, is_pro, version
     FROM social_templates WHERE status = 'published' ORDER BY updated_at DESC LIMIT 200`
  ).all()
  return c.json({ templates: rows.results ?? [] })
})

export { socialTemplatesAdmin, socialTemplatesPublic }
