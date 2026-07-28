const DEFAULT_TTL_SECONDS = 60

/**
 * Short-lived, database-backed cache for aggregate admin analytics. Database
 * triggers clear it when its source tables change, while the TTL bounds stale
 * data if a trigger is unavailable during a rolling deployment.
 */
export async function getCachedAnalytics<T>(
  db: D1Database,
  key: string,
  load: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<T> {
  const now = Math.floor(Date.now() / 1000)
  try {
    const cached = await db.prepare(
      'SELECT metric_value FROM analytics_cache WHERE metric_key = ? AND computed_at >= ?'
    ).bind(key, now - ttlSeconds).first<{ metric_value: string }>()
    if (cached) return JSON.parse(cached.metric_value) as T
  } catch {
    // Fall through for local databases that have not received the cache table.
  }

  const value = await load()
  try {
    await db.prepare(
      `INSERT INTO analytics_cache (metric_key, metric_value, computed_at)
       VALUES (?, ?, ?)
       ON CONFLICT(metric_key) DO UPDATE SET metric_value = excluded.metric_value, computed_at = excluded.computed_at`
    ).bind(key, JSON.stringify(value), now).run()
  } catch {
    // A cache write must never make analytics unavailable.
  }
  return value
}
