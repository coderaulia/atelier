import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../lib/jwt'
import { sha256Hex } from '../lib/tokens'
import type { Bindings } from '../types'

export type AdminVariables = {
  userId: string
  role: 'user' | 'admin'
}

export const adminMiddleware = createMiddleware<{ Bindings: Bindings; Variables: AdminVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const token = authHeader.slice(7)

    let userId: string
    try {
      userId = await verifyToken(token, c.env.JWT_SECRET)
    } catch {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const session = await c.env.DB
      .prepare('SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?')
      .bind(await sha256Hex(token), Math.floor(Date.now() / 1000))
      .first<{ user_id: string }>()

    if (!session) {
      return c.json({ error: 'Session expired' }, 401)
    }

    const user = await c.env.DB
      .prepare('SELECT role FROM users WHERE id = ?')
      .bind(userId)
      .first<{ role: string }>()

    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    c.set('userId', userId)
    c.set('role', 'admin')
    await next()
  }
)
