import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './auth/routes'
import usage from './routes/usage'
import admin from './routes/admin'
import logError from './routes/log-error'
import billing from './routes/billing'
import bugReports from './routes/bug-reports'
import { contentPublic } from './routes/admin/content'
import { checkRateLimit, getClientIP } from './lib/rate-limit'
import type { Bindings } from './types'

const DEFAULT_ORIGINS = ['https://atelier.vanailadigital.com']

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: (origin, c) => {
    if (!origin) return ''
    if (/^http:\/\/localhost:\d+$/.test(origin)) return origin
    const envOrigins = c.env?.ALLOWED_ORIGINS
    const allowed = envOrigins ? envOrigins.split(',').map((s: string) => s.trim()) : DEFAULT_ORIGINS
    return allowed.includes(origin) ? origin : ''
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))

// Global rate limiter - first layer DDoS protection (100 req/min per IP)
// Skip OPTIONS preflight requests
app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next()
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `global:${ip}`, 60, 100)
  if (!limit.allowed) {
    return c.json({ error: 'Rate limit exceeded', reset_at: limit.resetAt }, 429)
  }
  await next()
})

// Reject oversized payloads before JSON parsing.
app.use('*', async (c, next) => {
  const contentLength = Number(c.req.header('Content-Length') ?? '0')
  if (contentLength > 1_048_576) {
    return c.json({ error: 'Payload too large' }, 413)
  }
  await next()
})

app.use('*', async (c, next) => {
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://app.midtrans.com https://*.midtrans.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.midtrans.com https://app.midtrans.com https://*.midtrans.com; frame-src https://app.midtrans.com https://*.midtrans.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'")
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  await next()
})

app.route('/auth', auth)
app.route('/usage', usage)
app.route('/admin', admin)
app.route('/api/log-error', logError)
app.route('/billing', billing)
app.route('/bug-reports', bugReports)
app.route('/content', contentPublic)

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))

async function handleScheduled(env: Bindings) {
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60

  const expiredGrace = await env.DB
    .prepare('SELECT id, email FROM users WHERE plan = ? AND grace_until IS NOT NULL AND grace_until < ?')
    .bind('pro', now)
    .all<{ id: string; email: string }>()

  for (const user of expiredGrace.results ?? []) {
    await env.DB
      .prepare('UPDATE users SET plan = ?, pro_expires_at = NULL, grace_until = NULL, cancel_at_period_end = 0 WHERE id = ?')
      .bind('free', user.id)
      .run()
  }

  const deleted = await env.DB
    .prepare('SELECT id FROM users WHERE deleted_at IS NOT NULL AND deleted_at < ?')
    .bind(thirtyDaysAgo)
    .all<{ id: string }>()

  for (const user of deleted.results ?? []) {
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run()
  }

  await env.DB.prepare('DELETE FROM password_resets WHERE expires_at < ? OR used = 1').bind(now).run()
  await env.DB.prepare('DELETE FROM email_verifications WHERE expires_at < ? OR used = 1').bind(now).run()
  await env.DB.prepare('DELETE FROM rate_limit WHERE window_start < ?').bind(now - 3600).run()
  await env.DB.prepare('DELETE FROM failed_logins WHERE attempted_at < ?').bind(now - 24 * 60 * 60).run()
}

export default {
  fetch: app.fetch,
  scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env))
  },
}
