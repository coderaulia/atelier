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

  const row = await c.env.DB
    .prepare('SELECT count FROM usage_log WHERE user_id = ? AND tool_id = ? AND date = ?')
    .bind(userId, toolId, date)
    .first<{ count: number }>()

  const current = row?.count ?? 0

  if (current >= FREE_LIMIT) {
    return c.json(
      { error: 'Daily limit reached', limit: FREE_LIMIT, used: current, reset_at: resetAt() },
      429
    )
  }

  await c.env.DB
    .prepare(
      `INSERT INTO usage_log (user_id, tool_id, date, count) VALUES (?, ?, ?, 1)
       ON CONFLICT (user_id, tool_id, date) DO UPDATE SET count = count + 1`
    )
    .bind(userId, toolId, date)
    .run()

  return c.json({ used: current + 1, limit: FREE_LIMIT, reset_at: resetAt() })
})

export default usage
