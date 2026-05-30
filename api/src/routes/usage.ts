import { Hono } from 'hono'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import type { Bindings } from '../types'

const FREE_LIMIT = 5

// CV builder — server-side limit deferred, handle separately later
const UNLIMITED_TOOLS = new Set(['cv'])

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function resetAt(): number {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

const usage = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

usage.use('*', authMiddleware)

// GET /usage/me — must come before /:toolId
usage.get('/me', async (c) => {
  const userId = c.get('userId')
  const plan = c.get('plan')
  const since30 = new Date()
  since30.setUTCDate(since30.getUTCDate() - 30)
  const sinceStr = since30.toISOString().slice(0, 10)

  const rows = await c.env.DB
    .prepare(
      `SELECT date, tool_id, count,
        CASE WHEN ? = 'pro' THEN NULL ELSE ? END AS limit_val
       FROM usage_log
       WHERE user_id = ? AND date >= ?
       ORDER BY date DESC, tool_id ASC`
    )
    .bind(plan, FREE_LIMIT, userId, sinceStr)
    .all()

  return c.json({
    usage: (rows.results ?? []).map((r: any) => ({
      date: r.date,
      tool_id: r.tool_id,
      count: r.count,
      limit: r.limit_val,
    })),
  })
})

usage.get('/:toolId', async (c) => {
  const toolId = c.req.param('toolId')
  const userId = c.get('userId')
  const plan = c.get('plan')
  const date = todayUTC()

  if (plan === 'pro' || UNLIMITED_TOOLS.has(toolId)) {
    return c.json({ used: 0, limit: null, reset_at: resetAt() })
  }

  const row = await c.env.DB
    .prepare('SELECT count FROM usage_log WHERE user_id = ? AND tool_id = ? AND date = ?')
    .bind(userId, toolId, date)
    .first<{ count: number }>()

  return c.json({ used: row?.count ?? 0, limit: FREE_LIMIT, reset_at: resetAt() })
})

usage.post('/:toolId', async (c) => {
  const toolId = c.req.param('toolId')
  const userId = c.get('userId')
  const plan = c.get('plan')
  const date = todayUTC()

  if (plan === 'pro' || UNLIMITED_TOOLS.has(toolId)) {
    return c.json({ used: 1, limit: null, reset_at: resetAt() })
  }

  await c.env.DB
    .prepare(
      'INSERT OR IGNORE INTO usage_log (user_id, tool_id, date, count, limit_hits) VALUES (?, ?, ?, 0, 0)'
    )
    .bind(userId, toolId, date)
    .run()

  const updated = await c.env.DB
    .prepare(
      'UPDATE usage_log SET count = count + 1 WHERE user_id = ? AND tool_id = ? AND date = ? AND count < ? RETURNING count'
    )
    .bind(userId, toolId, date, FREE_LIMIT)
    .first<{ count: number }>()

  if (!updated) {
    const row = await c.env.DB
      .prepare(
        `UPDATE usage_log SET limit_hits = limit_hits + 1
         WHERE user_id = ? AND tool_id = ? AND date = ?
         RETURNING count`
      )
      .bind(userId, toolId, date)
      .first<{ count: number }>()

    return c.json(
      { error: 'Daily limit reached', limit: FREE_LIMIT, used: row?.count ?? FREE_LIMIT, reset_at: resetAt() },
      429
    )
  }

  return c.json({ used: updated.count, limit: FREE_LIMIT, reset_at: resetAt() })
})

export default usage
