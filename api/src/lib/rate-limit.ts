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

  // Get current count in window
  const row = await db
    .prepare('SELECT COUNT(*) as count FROM rate_limit WHERE key = ? AND window_start > ?')
    .bind(key, windowStart)
    .first<{ count: number }>()

  const count = row?.count ?? 0
  const resetAt = now + windowSec

  if (count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt }
  }

  // Record this attempt
  await db
    .prepare('INSERT INTO rate_limit (key, window_start) VALUES (?, ?)')
    .bind(key, now)
    .run()

  return { allowed: true, remaining: maxAttempts - count - 1, resetAt }
}

/**
 * Get client IP from request headers (Cloudflare sets CF-Connecting-IP).
 */
export function getClientIP(c: { req: { header: (name: string) => string | undefined } }): string {
  return c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown'
}
