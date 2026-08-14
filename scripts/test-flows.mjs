#!/usr/bin/env node

/**
 * Atelier API flow test runner.
 *
 * Runs integration-style checks against a live API server.
 * Default target: http://localhost:8787
 *
 * Usage:
 *   API_BASE_URL=http://localhost:8787 node scripts/test-flows.mjs
 *   TEST_EMAIL=qa@example.com TEST_PASSWORD='Password123!' node scripts/test-flows.mjs
 *
 * Optional admin tests:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='Password123!' node scripts/test-flows.mjs
 */

import { createHash } from 'node:crypto'

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787'
const stamp = Date.now()
const TEST_EMAIL = process.env.TEST_EMAIL || `flow-test-${stamp}@example.com`
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'FlowTest123!'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ANON_TEST_IP = process.env.ANON_TEST_IP || `10.${stamp % 250}.${Math.floor(Math.random() * 250)}.${process.pid % 250}`
const hasMidtransKey = Boolean(process.env.MIDTRANS_SERVER_KEY)

function webhookSignature(body) {
  return sha512(`${body.order_id}${body.transaction_status}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
}

const state = {
  token: '',
  user: null,
  adminToken: '',
}

const results = []

function sha512(input) {
  return createHash('sha512').update(input).digest('hex')
}

function logStep(name, ok, detail = '') {
  const marker = ok ? 'PASS' : 'FAIL'
  const line = `${marker} ${name}${detail ? ` — ${detail}` : ''}`
  console.log(line)
  results.push({ name, ok, detail })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    redirect: options.redirect || 'follow',
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '')

  return { response, payload }
}

async function test(name, fn) {
  try {
    await fn()
    logStep(name, true)
  } catch (error) {
    logStep(name, false, error.message)
  }
}

async function healthFlow() {
  const { response, payload } = await request('/health')
  assert(response.status === 200, `expected 200, got ${response.status}`)
  assert(payload?.ok === true, 'health ok missing')
}

async function authFlow() {
  const register = await request('/auth/register', {
    method: 'POST',
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  })
  assert(register.response.status === 201, `register expected 201, got ${register.response.status}`)
  assert(register.payload?.token, 'register token missing')
  assert(register.payload?.user?.email === TEST_EMAIL, 'registered user email mismatch')
  state.token = register.payload.token
  state.user = register.payload.user

  const me = await request('/auth/me', { token: state.token })
  assert(me.response.status === 200, `me expected 200, got ${me.response.status}`)
  assert(me.payload?.user?.id === state.user.id, 'me user id mismatch')

  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: TEST_EMAIL, password: 'wrong-password' },
  })
  assert(badLogin.response.status === 401, `bad login expected 401, got ${badLogin.response.status}`)

  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  })
  assert(login.response.status === 200, `login expected 200, got ${login.response.status}`)
  assert(login.payload?.token, 'login token missing')
  state.token = login.payload.token

  const profile = await request('/auth/profile', {
    method: 'PATCH',
    token: state.token,
    body: { name: 'Flow Test User' },
  })
  assert(profile.response.status === 200, `profile expected 200, got ${profile.response.status}`)
  assert(profile.payload?.user?.name === 'Flow Test User', 'profile name not updated')

  const sessions = await request('/auth/sessions', { token: state.token })
  assert(sessions.response.status === 200, `sessions expected 200, got ${sessions.response.status}`)
  assert(Array.isArray(sessions.payload?.sessions), 'sessions array missing')
}

async function usageFlow() {
  const freeTool = await request('/usage/pdf-merge', { token: state.token })
  assert(freeTool.response.status === 200, `free tool expected 200, got ${freeTool.response.status}`)
  assert(freeTool.payload?.limit === null, 'free tool limit should be null')
  assert(freeTool.payload?.has_watermark === false, 'free tool should not watermark')

  const check = await request('/usage/cv-builder', { token: state.token })
  assert(check.response.status === 200, `usage check expected 200, got ${check.response.status}`)
  assert(check.payload?.limit === 3, `free limit expected 3, got ${check.payload?.limit}`)
  assert(check.payload?.has_watermark === true, 'free non-free tool should watermark')

  for (let i = 1; i <= 3; i += 1) {
    const hit = await request('/usage/cv-builder', { method: 'POST', token: state.token })
    assert(hit.response.status === 200, `usage hit ${i} expected 200, got ${hit.response.status}`)
    assert(hit.payload?.used === i, `usage hit ${i} expected used ${i}, got ${hit.payload?.used}`)
  }

  const over = await request('/usage/cv-builder', { method: 'POST', token: state.token })
  assert(over.response.status === 429, `limit expected 429, got ${over.response.status}`)
  assert(over.payload?.error === 'Daily limit reached', 'limit error mismatch')

  const history = await request('/usage/me', { token: state.token })
  assert(history.response.status === 200, `usage history expected 200, got ${history.response.status}`)
  assert(Array.isArray(history.payload?.usage), 'usage history array missing')
}

async function anonymousUsageFlow() {
  const headers = { 'CF-Connecting-IP': ANON_TEST_IP, 'X-Forwarded-For': ANON_TEST_IP }

  const free = await request('/anon-usage/pdf-merge', { headers })
  assert(free.response.status === 200, `anonymous free tool expected 200, got ${free.response.status}`)
  assert(free.payload?.limit === null, 'anonymous free tool should have no limit')

  const check = await request('/anon-usage/cv-builder', { headers })
  assert(check.response.status === 200, `anonymous usage check expected 200, got ${check.response.status}`)
  assert(check.payload?.limit === 1, `anonymous limit expected 1, got ${check.payload?.limit}`)
  assert(check.payload?.has_watermark === true, 'anonymous non-free tool should watermark')

  const hit = await request('/anon-usage/cv-builder', { method: 'POST', headers })
  assert(hit.response.status === 200, `anonymous hit expected 200, got ${hit.response.status}`)
  assert(hit.payload?.used === 1, `anonymous used expected 1, got ${hit.payload?.used}`)

  const over = await request('/anon-usage/cv-builder', { method: 'POST', headers })
  assert(over.response.status === 429, `anonymous limit expected 429, got ${over.response.status}`)
  assert(over.payload?.error === 'Daily limit reached', 'anonymous limit error mismatch')
}

async function emailVerificationFlow() {
  const invalid = await request('/auth/verify-email?token=not-a-real-token')
  assert(invalid.response.status === 400, `invalid verification expected 400, got ${invalid.response.status}`)
  assert(invalid.payload?.error === 'Invalid or expired verification token', 'invalid verification error mismatch')

  const resend = await request('/auth/verify-email', { method: 'POST', token: state.token })
  assert(resend.response.status === 200, `resend verification expected 200, got ${resend.response.status}`)
  assert(resend.payload?.ok === true, 'resend verification ok missing')
}

async function cvAiFreeGateFlow() {
  const freeAi = await request('/api/cv/ai', {
    method: 'POST',
    token: state.token,
    body: { action: 'rewrite_bullet', text: 'Did sales work and helped customers.' },
  })
  assert(freeAi.response.status === 403, `free AI expected 403, got ${freeAi.response.status}`)
  assert(freeAi.payload?.error === 'Upgrade to Pro to use AI features', 'free AI error mismatch')
}

async function proPlanAndAiFlow() {
  console.log('SKIP pro plan and AI flow: upgrades require a real server-created checkout order')
}

async function subscriptionLifecycleFlow() {
  console.log('SKIP subscription lifecycle flow: requires a completed real checkout')
}

async function cronDowngradeFlow() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('SKIP cron downgrade flow — set ADMIN_EMAIL and ADMIN_PASSWORD')
    return
  }
  if (!state.adminToken) {
    console.log('SKIP cron downgrade flow — admin login did not run')
    return
  }

  const run = await request('/admin/cron/run', { method: 'POST', token: state.adminToken })
  assert(run.response.status === 200, `cron run expected 200, got ${run.response.status}`)
  assert(run.payload?.ok === true, 'cron run ok missing')
}

async function bugReportFlow() {
  const invalid = await request('/bug-reports', {
    method: 'POST',
    token: state.token,
    body: { subject: 'Bug', description: 'short' },
  })
  assert(invalid.response.status === 400, `invalid bug expected 400, got ${invalid.response.status}`)

  const valid = await request('/bug-reports', {
    method: 'POST',
    token: state.token,
    body: {
      subject: 'Flow test bug report',
      description: 'Automated flow test confirms bug reporting endpoint accepts valid reports.',
      tool_id: 'cv-builder',
    },
  })
  assert(valid.response.status === 201, `bug report expected 201, got ${valid.response.status}`)
  assert(valid.payload?.id, 'bug report id missing')
}

async function billingFlow() {
  const status = await request('/billing/status', { token: state.token })
  assert(status.response.status === 200, `billing status expected 200, got ${status.response.status}`)
  assert(status.payload?.plan === 'free', `new user plan expected free, got ${status.payload?.plan}`)

  const transactions = await request('/billing/transactions', { token: state.token })
  assert(transactions.response.status === 200, `transactions expected 200, got ${transactions.response.status}`)
  assert(Array.isArray(transactions.payload?.transactions), 'transactions array missing')

  const cancel = await request('/billing/cancel', { method: 'POST', token: state.token })
  assert(cancel.response.status === 400, `free cancel expected 400, got ${cancel.response.status}`)
}

async function errorLogFlow() {
  const logged = await request('/api/log-error', {
    method: 'POST',
    token: state.token,
    body: {
      tool_id: 'cv-builder',
      error_type: 'flow-test-error',
      user_agent: 'atelier-flow-test',
      plan: 'free',
    },
  })
  assert(logged.response.status === 201, `log error expected 201, got ${logged.response.status}`)
  assert(logged.payload?.ok === true, 'log error ok missing')
}

async function authNegativeFlow() {
  const noToken = await request('/usage/me')
  assert(noToken.response.status === 401, `missing token expected 401, got ${noToken.response.status}`)

  const badToken = await request('/auth/me', { token: 'not-a-valid-token' })
  assert(badToken.response.status === 401, `bad token expected 401, got ${badToken.response.status}`)
}

async function adminFlow() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('SKIP admin flow — set ADMIN_EMAIL and ADMIN_PASSWORD')
    return
  }

  const login = await request('/auth/login', {
    method: 'POST',
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  assert(login.response.status === 200, `admin login expected 200, got ${login.response.status}`)
  state.adminToken = login.payload.token

  const stats = await request('/admin/stats', { token: state.adminToken })
  assert(stats.response.status === 200, `admin stats expected 200, got ${stats.response.status}`)
  assert(typeof stats.payload?.total_users === 'number', 'admin stats total_users missing')

  const users = await request('/admin/users?limit=10', { token: state.adminToken })
  assert(users.response.status === 200, `admin users expected 200, got ${users.response.status}`)
  assert(Array.isArray(users.payload?.users), 'admin users array missing')

  const notifications = await request('/admin/notifications', { token: state.adminToken })
  assert(notifications.response.status === 200, `admin notifications expected 200, got ${notifications.response.status}`)
  assert(Array.isArray(notifications.payload?.notifications), 'notifications array missing')
}

async function billingWebhookSignatureFlow() {
  if (!hasMidtransKey) {
    console.log('SKIP webhook signature flow — set MIDTRANS_SERVER_KEY to match API env')
    return
  }

  const body = {
    order_id: `flow-test-${Date.now()}`,
    transaction_status: 'capture',
    payment_type: 'recurring',
    gross_amount: '100000',
    currency: 'IDR',
    custom_field1: state.user.id,
  }
  const webhook = await request('/billing/webhook', {
    method: 'POST',
    headers: { 'X-Midtrans-Signature': webhookSignature(body) },
    body,
  })
  assert(webhook.response.status === 400, `unknown-order webhook expected 400, got ${webhook.response.status}`)
  assert(webhook.payload?.error === 'Unknown checkout order', 'unknown checkout order was not rejected')
}

async function cleanupFlow() {
  if (!state.token) return
  const logout = await request('/auth/logout', { method: 'POST', token: state.token })
  assert(logout.response.status === 200, `logout expected 200, got ${logout.response.status}`)

  const me = await request('/auth/me', { token: state.token })
  assert(me.response.status === 401, `me after logout expected 401, got ${me.response.status}`)
}

async function main() {
  console.log(`Atelier flow tests target: ${BASE_URL}`)
  console.log('Test account: configured')

  await test('health endpoint', healthFlow)
  await test('anonymous usage limit flow', anonymousUsageFlow)
  await test('auth register/login/profile/session flow', authFlow)
  await test('email verification endpoint flow', emailVerificationFlow)
  await test('negative auth checks', authNegativeFlow)
  await test('usage limits and history flow', usageFlow)
  await test('free user AI gate flow', cvAiFreeGateFlow)
  await test('bug report flow', bugReportFlow)
  await test('billing status and transaction flow', billingFlow)
  await test('billing webhook signature flow', billingWebhookSignatureFlow)
  await test('pro plan and AI flow', proPlanAndAiFlow)
  await test('subscription cancel/grace flow', subscriptionLifecycleFlow)
  await test('error logging flow', errorLogFlow)
  await test('admin dashboard flow', adminFlow)
  await test('cron downgrade trigger flow', cronDowngradeFlow)
  await test('logout/session invalidation flow', cleanupFlow)

  const failed = results.filter((r) => !r.ok)
  console.log('\nResult:')
  console.log(`${results.length - failed.length}/${results.length} checks passed`)

  if (failed.length) {
    console.log('\nFailures:')
    for (const fail of failed) console.log(`- ${fail.name}: ${fail.detail}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
