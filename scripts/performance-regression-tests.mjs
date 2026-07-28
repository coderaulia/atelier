import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const source = (path) => readFileSync(resolve(root, path), 'utf8')

test('scheduled cleanup uses set-based writes', () => {
  for (const path of ['api/src/index.ts', 'api/src/routes/admin.ts']) {
    const code = source(path)
    assert.doesNotMatch(code, /for \(const user of (?:expiredGrace|deleted)\.results/)
    assert.match(code, /DELETE FROM users WHERE deleted_at IS NOT NULL AND deleted_at < \?/)
  }
})

test('analytics has bounded, invalidated caching and matching indexes', () => {
  const analytics = source('api/src/routes/admin/analytics.ts')
  const cache = source('api/src/lib/analytics-cache.ts')
  const migration = source('api/src/db/migrations/013_performance_controls.sql')
  assert.match(analytics, /MAX_ANALYTICS_DAYS = 365/)
  assert.match(analytics, /getCachedAnalytics/)
  assert.match(cache, /computed_at >= \?/)
  assert.match(migration, /idx_transactions_status_created/)
  assert.match(migration, /invalidate_analytics_transactions_insert/)
})

test('history and upstream calls are bounded', () => {
  const billing = source('api/src/routes/billing.ts')
  const auth = source('api/src/auth/routes.ts')
  const ai = source('api/src/routes/cv-ai.ts')
  assert.match(billing, /ORDER BY created_at DESC LIMIT \? OFFSET \?/)
  assert.match(auth, /ORDER BY last_used DESC LIMIT 100/)
  assert.match(ai, /controller\.abort\(\), 20_000/)
})
