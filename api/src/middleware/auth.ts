import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../lib/jwt'
import { sha256Hex } from '../lib/tokens'
import { createAuth } from '../lib/better-auth'
import type { Bindings } from '../types'

export type AuthVariables = {
  userId: string
  plan: 'free' | 'pro'
}

export const authMiddleware = createMiddleware<{ Bindings: Bindings; Variables: AuthVariables }>(
  async (c, next) => {
    // Try Better Auth session first
    try {
      const auth = createAuth(c.env)
      const session = await auth.api.getSession({ headers: c.req.raw.headers })
      
      if (session?.user?.id) {
        // Verify user exists in app users table and is not deleted
        const user = await c.env.DB
          .prepare('SELECT plan, deleted_at FROM users WHERE id = ?')
          .bind(session.user.id)
          .first<{ plan: string; deleted_at: number | null }>()
        
        if (!user) {
          return c.json({ error: 'User not found' }, 404)
        }
        
        if (user.deleted_at) {
          return c.json({ error: 'Account deleted' }, 403)
        }
        
        c.set('userId', session.user.id)
        c.set('plan', user.plan as 'free' | 'pro')
        await next()
        
        // Capture geo data from Cloudflare header (fire-and-forget)
        const country = c.req.header('CF-IPCountry') ?? 'XX'
        const today = new Date().toISOString().slice(0, 10)
        const now = Math.floor(Date.now() / 1000)
        c.env.DB.prepare(
          `INSERT INTO user_geo_daily (user_id, date, country_code, last_seen) VALUES (?, ?, ?, ?)
           ON CONFLICT (user_id, date) DO UPDATE SET country_code = ?, last_seen = ?`
        )
          .bind(session.user.id, today, country, now, country, now)
          .run()
          .catch(() => {}) // Non-blocking, Don't fail request
        
        return
      }
    } catch {
      // Better Auth session failed, fall through to legacy JWT
    }
    
    // Fall back to old JWT token
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const token = authHeader.slice(7)
    
    let userId: string
    try {
      userId = await verifyToken(token, c.env.JWT_SECRET, c.env.JWT_SECRET_OLD)
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
      .prepare('SELECT plan, deleted_at FROM users WHERE id = ?')
      .bind(userId)
      .first<{ plan: string; deleted_at: number | null }>()
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    if (user.deleted_at) {
      return c.json({ error: 'Account deleted' }, 403)
    }
    
    c.set('userId', userId)
    c.set('plan', user.plan as 'free' | 'pro')
    await next()
    
    // Capture geo data from Cloudflare header (fire-and-forget)
    const country = c.req.header('CF-IPCountry') ?? 'XX'
    const today = new Date().toISOString().slice(0, 10)
    const now = Math.floor(Date.now() / 1000)
    c.env.DB.prepare(
      `INSERT INTO user_geo_daily (user_id, date, country_code, last_seen) VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, date) DO UPDATE SET country_code = ?, last_seen = ?`
    )
      .bind(userId, today, country, now, country, now)
      .run()
      .catch(() => {}) // Non-blocking, Don't fail request
  }
)
