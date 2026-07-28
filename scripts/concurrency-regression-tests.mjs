import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const source = (path) => readFileSync(resolve(root, path), 'utf8')

test('rate limits admit requests with one conditional insert', () => {
  const code = source('api/src/lib/rate-limit.ts')
  assert.match(code, /INSERT INTO rate_limit[\s\S]*SELECT \?, \?[\s\S]*COUNT\(\*\)[\s\S]*RETURNING id/)
  assert.doesNotMatch(code, /checkCachedRateLimit|recordCachedRateLimit/)
})

test('payment and credit effects have durable replay guards', () => {
  const migration = source('api/src/db/migrations/012_concurrency_controls.sql')
  const billing = source('api/src/routes/billing.ts')
  assert.match(migration, /idx_transactions_midtrans_order_unique/)
  assert.match(migration, /idx_checkout_orders_active_purchase/)
  assert.match(migration, /credit_usage_debit/)
  assert.match(billing, /processing_token/)
})

test('state-changing admin and auth flows use compare-and-set predicates', () => {
  const auth = source('api/src/auth/routes.ts')
  const refunds = source('api/src/routes/admin/refunds.ts')
  const templates = source('api/src/routes/admin/social-templates.ts')
  assert.match(auth, /UPDATE password_resets SET used = 1[\s\S]*used = 0[\s\S]*RETURNING/)
  assert.match(auth, /WHERE id = \? AND password_hash = \?/)
  assert.match(refunds, /WHERE id = \? AND status = 'pending' RETURNING \*/)
  assert.match(templates, /WHERE id = \? AND version = \? RETURNING version/)
})
