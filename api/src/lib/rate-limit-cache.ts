interface CacheEntry {
  count: number
  windowStart: number
}

const cache = new Map<string, CacheEntry>()

export function checkCachedRateLimit(
  key: string,
  windowSec: number,
  maxAttempts: number
): { allowed: boolean; remaining: number; resetAt: number } | null {
  const now = Math.floor(Date.now() / 1000)
  const entry = cache.get(key)

  if (!entry) return null

  if (now - entry.windowStart > windowSec) {
    cache.delete(key)
    return null
  }

  const resetAt = entry.windowStart + windowSec
  const allowed = entry.count < maxAttempts

  return { allowed, remaining: Math.max(0, maxAttempts - entry.count), resetAt }
}

export function recordCachedRateLimit(key: string, windowSec: number): void {
  const now = Math.floor(Date.now() / 1000)
  const entry = cache.get(key)

  if (!entry || now - entry.windowStart > windowSec) {
    cache.set(key, { count: 1, windowStart: now })
  } else {
    entry.count++
  }
}
