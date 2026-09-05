import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../lib/jwt'
import { sha256Hex } from '../lib/tokens'
import { createAuth } from '../lib/better-auth'
import type { Bindings } from '../types'

export type AuthVariables = {
  userId: string
  plan: 'free' | 'pro'
  proTier: 'starter' | 'pro' | 'business' | null
}

async function resolveEntitlement(db: D1Database, userId: string, user: { plan: string; pro_tier: string | null; pro_expires_at: number | null; grace_until: number | null }) {
  const now = Math.floor(Date.now() / 1000)
  const graceActive = user.grace_until !== null && user.grace_until > now
  if (user.plan === 'pro' && user.pro_expires_at !== null && user.pro_expires_at <= now && !graceActive) {
    await db.prepare("UPDATE users SET plan = 'free', pro_tier = NULL, pro_expires_at = NULL, grace_until = NULL, cancel_at_period_end = 0, version = version + 1 WHERE id = ? AND plan = 'pro'").bind(userId).run()
    return { plan: 'free' as const, proTier: null }
  }
  return { plan: user.plan as 'free' | 'pro', proTier: user.pro_tier as 'starter' | 'pro' | 'business' | null }
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
          .prepare('SELECT plan, pro_tier, pro_expires_at, grace_until, deleted_at FROM users WHERE id = ?')
          .bind(session.user.id)
          .first<{ plan: string; pro_tier: string | null; pro_expires_at: number | null; grace_until: number | null; deleted_at: number | null }>()

        if (!user) {
          return c.json({ error: 'User not found' }, 404)
        }

        if (user.deleted_at) {
          return c.json({ error: 'Account deleted' }, 403)
        }

        const entitlement = await resolveEntitlement(c.env.DB, session.user.id, user)
        c.set('userId', session.user.id)
        c.set('plan', entitlement.plan)
        c.set('proTier', entitlement.proTier)
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
      .prepare('SELECT plan, pro_tier, pro_expires_at, grace_until, deleted_at FROM users WHERE id = ?')
      .bind(userId)
      .first<{ plan: string; pro_tier: string | null; pro_expires_at: number | null; grace_until: number | null; deleted_at: number | null }>()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    if (user.deleted_at) {
      return c.json({ error: 'Account deleted' }, 403)
    }

    const entitlement = await resolveEntitlement(c.env.DB, userId, user)
    c.set('userId', userId)
    c.set('plan', entitlement.plan)
    c.set('proTier', entitlement.proTier)
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
