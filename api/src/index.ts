import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import auth from './auth/routes'
import usage from './routes/usage'
import admin from './routes/admin'
import logError from './routes/log-error'
import billing from './routes/billing'
import bugReports from './routes/bug-reports'
import cvAi from './routes/cv-ai'
import anonUsage from './routes/anon-usage'
import { contentPublic } from './routes/admin/content'
import { socialTemplatesPublic } from './routes/admin/social-templates'
import { checkRateLimit, getClientIP } from './lib/rate-limit'
import { createAuth } from './lib/better-auth'
import { isAllowedOrigin, requiresCsrfProtection } from './lib/request-security'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: (origin, c) => {
    if (!origin) return ''
    return isAllowedOrigin(origin, c.env) ? origin : ''
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Protection'],
  exposeHeaders: ['Content-Length'],
  credentials: true,
  maxAge: 86400,
}))

app.use('*', async (c, next) => {
  if (!requiresCsrfProtection(c.req.raw)) return next()

  const origin = c.req.header('Origin')
  const fetchSite = c.req.header('Sec-Fetch-Site')
  if (!origin || !isAllowedOrigin(origin, c.env) || fetchSite === 'cross-site') {
    return c.json({ error: 'Invalid request origin' }, 403)
  }
  if (c.req.header('X-CSRF-Protection') !== '1') {
    return c.json({ error: 'Missing CSRF protection' }, 403)
  }
  await next()
})

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

// Enforce the limit for declared and streamed bodies before route parsing.
app.use('*', bodyLimit({
  maxSize: 1_048_576,
  onError: (c) => c.json({ error: 'Payload too large' }, 413),
}))

app.use('*', async (c, next) => {
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://app.midtrans.com https://*.midtrans.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.midtrans.com https://app.midtrans.com https://*.midtrans.com; frame-src https://app.midtrans.com https://*.midtrans.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'")
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  await next()
})

app.on(['GET', 'POST'], '/api/auth/*', (c) => createAuth(c.env).handler(c.req.raw))
app.route('/auth', auth)
app.route('/usage', usage)
app.route('/admin', admin)
app.route('/api/log-error', logError)
app.route('/billing', billing)
app.route('/bug-reports', bugReports)
app.route('/content', contentPublic)
app.route('/social-templates', socialTemplatesPublic)
app.route('/api', cvAi)
app.route('/anon-usage', anonUsage)

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
  await env.DB.prepare('DELETE FROM anonymous_usage WHERE created_at < ?').bind(now - 7 * 24 * 60 * 60).run()
}

export default {
  fetch: app.fetch,
  scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    if (event.cron) {
      ctx.waitUntil(handleScheduled(env))
    }
  },
}
