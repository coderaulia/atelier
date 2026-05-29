import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './auth/routes'
import usage from './routes/usage'
import admin from './routes/admin'
import logError from './routes/log-error'
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

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))

export default app
