import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings } from '../types'

const logError = new Hono<{ Bindings: Bindings }>()

const schema = z.object({
  tool_id: z.string().min(1).max(80),
  error_type: z.string().min(1).max(120),
  user_agent: z.string().max(300).optional(),
  plan: z.enum(['free', 'pro']).optional(),
})

logError.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = schema.safeParse(body)
  if (!result.success) return c.json({ error: 'Invalid error payload' }, 400)
  const data = result.data

  await c.env.DB.prepare(
    'INSERT INTO error_log (tool_id, error_type, user_agent, plan) VALUES (?, ?, ?, ?)'
  ).bind(data.tool_id, data.error_type, data.user_agent ?? c.req.header('User-Agent') ?? null, data.plan ?? null).run()

  return c.json({ ok: true }, 201)
})

export default logError
