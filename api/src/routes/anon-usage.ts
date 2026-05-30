import { Hono } from 'hono'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import type { Bindings } from '../types'

const FREE_TOOLS = new Set(['pdf-merge', 'pdf-compress', 'image-converter'])
const ANON_LIMIT = 1

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function resetAt(): number {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

const anonUsage = new Hono<{ Bindings: Bindings }>()

anonUsage.get('/:toolId', async (c) => {
  const toolId = c.req.param('toolId')
  const ip = getClientIP(c)
  const date = todayUTC()

  if (FREE_TOOLS.has(toolId)) {
    return c.json({ used: 0, limit: null, reset_at: resetAt(), has_watermark: false })
  }

  const row = await c.env.DB
    .prepare('SELECT count FROM anonymous_usage WHERE ip_address = ? AND tool_id = ? AND date = ?')
    .bind(ip, toolId, date)
    .first<{ count: number }>()

  return c.json({ used: row?.count ?? 0, limit: ANON_LIMIT, reset_at: resetAt(), has_watermark: true })
})

anonUsage.post('/:toolId', async (c) => {
  const toolId = c.req.param('toolId')
  const ip = getClientIP(c)
  const date = todayUTC()

  const limit = await checkRateLimit(c.env.DB, `anon-usage:${ip}`, 60, 10)
  if (!limit.allowed) return c.json({ error: 'Too many requests', reset_at: limit.resetAt }, 429)

  if (FREE_TOOLS.has(toolId)) {
    return c.json({ used: 0, limit: null, reset_at: resetAt(), has_watermark: false })
  }

  await c.env.DB.prepare('INSERT OR IGNORE INTO anonymous_usage (ip_address, tool_id, date, count) VALUES (?, ?, ?, 0)').bind(ip, toolId, date).run()

  const updated = await c.env.DB
    .prepare('UPDATE anonymous_usage SET count = count + 1 WHERE ip_address = ? AND tool_id = ? AND date = ? AND count < ? RETURNING count')
    .bind(ip, toolId, date, ANON_LIMIT)
    .first<{ count: number }>()

  if (!updated) {
    const row = await c.env.DB.prepare('SELECT count FROM anonymous_usage WHERE ip_address = ? AND tool_id = ? AND date = ?').bind(ip, toolId, date).first<{ count: number }>()
    return c.json({ error: 'Daily limit reached', limit: ANON_LIMIT, used: row?.count ?? ANON_LIMIT, reset_at: resetAt(), has_watermark: true }, 429)
  }

  return c.json({ used: updated.count, limit: ANON_LIMIT, reset_at: resetAt(), has_watermark: true })
})

export default anonUsage
