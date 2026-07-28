import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { staticFileFor } from '../server.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const apiRoot = join(repoRoot, 'api')
const wranglerCli = join(apiRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js')

function runWrangler(args) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], {
    cwd: apiRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  return result.stdout
}

function webhookSignature(orderId, status, amount, secret) {
  return createHash('sha512').update(`${orderId}${status}${amount}${secret}`).digest('hex')
}

async function waitForWorker(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${url}/health`)
      if (response.ok) return
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 250))
  }
  throw new Error('Local Worker did not become ready')
}

test('static server rejects sibling-prefix traversal and malformed encoding', () => {
  const sibling = join(repoRoot, 'dist-security-test')
  mkdirSync(sibling, { recursive: true })
  writeFileSync(join(sibling, 'secret.txt'), 'not public')

  try {
    assert.equal(staticFileFor('/../dist-security-test/secret.txt'), null)
    assert.equal(staticFileFor('/..%2Fdist-security-test/secret.txt'), null)
    assert.equal(staticFileFor('/..%5Cdist-security-test%5Csecret.txt'), null)
    assert.equal(staticFileFor('/%E0%A4%A'), null)
  } finally {
    rmSync(sibling, { recursive: true, force: true })
  }
})

test('password hash tooling uses the current work factor without echoing the password', () => {
  const password = 'SecurityRegressionPassword!'
  const script = join(repoRoot, 'api', 'scripts', 'hash-password.mjs')
  const result = spawnSync(process.execPath, [script, password], { encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /^password_hash=pbkdf2_sha256\$600000\$/)
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(password.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('admin scripts do not interpolate raw passwords into console output', () => {
  for (const name of ['seed-admin.mjs', 'create-admin-remote.mjs', 'hash-password.mjs']) {
    const source = readFileSync(join(repoRoot, 'api', 'scripts', name), 'utf8')
    assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*\$\{password\}/i, name)
  }
})

test('payment webhook uses stored order ownership and rejects amount changes', { timeout: 45_000 }, async () => {
  const baseUrl = 'http://127.0.0.1:18790'
  const secret = 'security-webhook-test-secret'
  const ownerId = 'security-owner-001'
  const victimId = 'security-victim-001'
  const orderId = 'SECURITY_CHECKOUT_OWNER_001'
  const mismatchOrderId = 'SECURITY_CHECKOUT_AMOUNT_001'

  runWrangler(['d1', 'execute', 'vanaila-studio', '--local', '--file', 'src/db/schema.sql'])
  runWrangler([
    'd1', 'execute', 'vanaila-studio', '--local', '--command',
    `INSERT OR REPLACE INTO users (id,email,password_hash,plan,role,status,email_verified) VALUES ('${ownerId}','security-owner@example.invalid','test','free','user','active',1);
     INSERT OR REPLACE INTO users (id,email,password_hash,plan,role,status,email_verified) VALUES ('${victimId}','security-victim@example.invalid','test','free','user','active',1);
     INSERT OR REPLACE INTO checkout_orders (order_id,user_id,purchase_type,product_id,amount,currency,status,updated_at) VALUES ('${orderId}','${ownerId}','subscription','pro',99000,'IDR','pending',unixepoch());
     INSERT OR REPLACE INTO checkout_orders (order_id,user_id,purchase_type,product_id,amount,currency,status,updated_at) VALUES ('${mismatchOrderId}','${ownerId}','pack','cv-10',99000,'IDR','pending',unixepoch());`,
  ])

  const worker = spawn(process.execPath, [
    wranglerCli, 'dev', '--local', '--port', '18790',
    '--var', `MIDTRANS_SERVER_KEY:${secret}`,
    '--var', 'JWT_SECRET:security-test-jwt-secret',
    '--var', 'BREVO_API_KEY:security-test-brevo-key',
    '--var', 'ENVIRONMENT:development',
    '--var', 'APP_URL:http://localhost:5173',
    '--var', 'ALLOWED_ORIGINS:http://localhost:5173',
  ], { cwd: apiRoot, windowsHide: true, stdio: 'ignore' })

  try {
    await waitForWorker(baseUrl)

    const validBody = {
      order_id: orderId,
      transaction_status: 'capture',
      gross_amount: '99000',
      currency: 'IDR',
      custom_field1: victimId,
    }
    const validHeaders = {
      'Content-Type': 'application/json',
      'X-Midtrans-Signature': webhookSignature(orderId, 'capture', '99000', secret),
    }

    const valid = await fetch(`${baseUrl}/billing/webhook`, {
      method: 'POST', headers: validHeaders, body: JSON.stringify(validBody),
    })
    assert.equal(valid.status, 200, await valid.text())

    const replay = await fetch(`${baseUrl}/billing/webhook`, {
      method: 'POST', headers: validHeaders, body: JSON.stringify(validBody),
    })
    assert.equal(replay.status, 200, await replay.text())

    const mismatchBody = {
      order_id: mismatchOrderId,
      transaction_status: 'capture',
      gross_amount: '1',
      currency: 'IDR',
      custom_field1: victimId,
    }
    const mismatch = await fetch(`${baseUrl}/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Midtrans-Signature': webhookSignature(mismatchOrderId, 'capture', '1', secret),
      },
      body: JSON.stringify(mismatchBody),
    })
    assert.equal(mismatch.status, 400)

    const users = JSON.parse(runWrangler([
      'd1', 'execute', 'vanaila-studio', '--local', '--json', '--command',
      `SELECT id, plan FROM users WHERE id IN ('${ownerId}', '${victimId}') ORDER BY id`,
    ]))[0].results
    const transactions = JSON.parse(runWrangler([
      'd1', 'execute', 'vanaila-studio', '--local', '--json', '--command',
      `SELECT user_id, status, COUNT(*) AS count FROM transactions WHERE midtrans_order_id = '${orderId}' GROUP BY user_id, status`,
    ]))[0].results
    const orders = JSON.parse(runWrangler([
      'd1', 'execute', 'vanaila-studio', '--local', '--json', '--command',
      `SELECT order_id, status FROM checkout_orders WHERE order_id IN ('${orderId}', '${mismatchOrderId}') ORDER BY order_id`,
    ]))[0].results

    assert.equal(users.find((user) => user.id === ownerId)?.plan, 'pro')
    assert.equal(users.find((user) => user.id === victimId)?.plan, 'free')
    assert.deepEqual(transactions, [{ user_id: ownerId, status: 'success', count: 1 }])
    assert.equal(orders.find((order) => order.order_id === orderId)?.status, 'processed')
    assert.equal(orders.find((order) => order.order_id === mismatchOrderId)?.status, 'pending')
  } finally {
    worker.kill()
    await Promise.race([
      new Promise((resolveExit) => worker.once('exit', resolveExit)),
      new Promise((resolveWait) => setTimeout(resolveWait, 2_000)),
    ])
    runWrangler([
      'd1', 'execute', 'vanaila-studio', '--local', '--command',
      `DELETE FROM transactions WHERE midtrans_order_id IN ('${orderId}', '${mismatchOrderId}');
       DELETE FROM checkout_orders WHERE order_id IN ('${orderId}', '${mismatchOrderId}');
       DELETE FROM users WHERE id IN ('${ownerId}', '${victimId}');`,
    ])
  }
})
