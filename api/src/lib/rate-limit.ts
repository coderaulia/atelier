/**
 * D1-based sliding window rate limiter for Cloudflare Workers.
 * Uses a simple counter + window approach since Workers are stateless.
 *
 * In production, consider Cloudflare Rate Limiting Rules for edge enforcement.
 * This provides application-level protection against burst abuse.
 */
import type { D1Database } from '@cloudflare/workers-types'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment rate limit counter for a given key.
 * @param db - D1 database instance
 * @param key - Unique identifier (e.g., `login:1.2.3.4` or `log-error:1.2.3.4`)
 * @param windowSec - Time window in seconds (e.g., 60 for per-minute)
 * @param maxAttempts - Maximum allowed attempts in the window
 */
export async function checkRateLimit(
  db: D1Database,
  key: string,
  windowSec: number,
  maxAttempts: number
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSec

  // Clean old entries for this key
  await db
    .prepare('DELETE FROM rate_limit WHERE key = ? AND window_start <= ?')
    .bind(key, windowStart)
    .run()

  const resetAt = now + windowSec

  // This must be one statement: a SELECT followed by INSERT lets concurrent
  // Worker isolates each observe spare capacity and all exceed the limit.
  const admitted = await db
    .prepare(
      `INSERT INTO rate_limit (key, window_start)
       SELECT ?, ?
       WHERE (SELECT COUNT(*) FROM rate_limit WHERE key = ? AND window_start > ?) < ?
       RETURNING id`
    )
    .bind(key, now, key, windowStart, maxAttempts)
    .first<{ id: number }>()

  if (!admitted) return { allowed: false, remaining: 0, resetAt }

  const row = await db
    .prepare('SELECT COUNT(*) AS count FROM rate_limit WHERE key = ? AND window_start > ?')
    .bind(key, windowStart)
    .first<{ count: number }>()
  return { allowed: true, remaining: Math.max(0, maxAttempts - (row?.count ?? maxAttempts)), resetAt }
}

/**
 * Get client IP from request headers (Cloudflare sets CF-Connecting-IP).
 */
export function getClientIP(c: { env?: { ENVIRONMENT?: string }; req: { header: (name: string) => string | undefined } }): string {
  const cloudflareIp = c.req.header('CF-Connecting-IP')
  if (cloudflareIp) return cloudflareIp

  // X-Forwarded-For is only useful in local development; public clients can forge it.
  if (c.env?.ENVIRONMENT !== 'production') {
    return c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown'
  }
  return 'unknown'
}
