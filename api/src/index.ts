import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './auth/routes'
import usage from './routes/usage'
import admin from './routes/admin'
import logError from './routes/log-error'
import billing from './routes/billing'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://atelier.vanailadigital.com',
    ]
    return allowed.includes(origin) ? origin : ''
  },
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))

app.route('/auth', auth)
app.route('/usage', usage)
app.route('/admin', admin)
app.route('/api/log-error', logError)
app.route('/billing', billing)

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
}

export default {
  fetch: app.fetch,
  scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env))
  },
}
