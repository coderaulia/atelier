import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import type { Bindings } from '../types'

const logError = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

const schema = z.object({
  tool_id: z.string().min(1).max(80),
  error_type: z.string().min(1).max(120),
  user_agent: z.string().max(300).optional(),
  plan: z.enum(['free', 'pro']).optional(),
})

logError.post('/', authMiddleware, async (c) => {
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `log-error:${ip}`, 60, 20)
  if (!limit.allowed) return c.json({ error: 'Too many error submissions', reset_at: limit.resetAt }, 429)

  const body = await c.req.json().catch(() => null)
  if (!body || JSON.stringify(body).length > 1024) return c.json({ error: 'Payload too large' }, 413)
  const result = schema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid error payload' }, 400)
  const data = result.data

  await c.env.DB.prepare(
    'INSERT INTO error_log (tool_id, error_type, user_agent, plan) VALUES (?, ?, ?, ?)'
  ).bind(data.tool_id, data.error_type, data.user_agent ?? c.req.header('User-Agent') ?? null, data.plan ?? null).run()

  return c.json({ ok: true }, 201)
})

export default logError
