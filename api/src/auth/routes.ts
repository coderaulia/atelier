import { Hono } from 'hono'
import { z } from 'zod'
import { signToken, verifyToken } from '../lib/jwt'
import { hashPassword, verifyPassword } from '../lib/password'
import type { Bindings } from '../types'

const auth = new Hono<{ Bindings: Bindings }>()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid email or password (min 8 chars)' }, 400)
  }
  const { email, password } = result.data

  const password_hash = await hashPassword(password)

  try {
    const user = await c.env.DB
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id, email, plan, role, status, created_at')
      .bind(email, password_hash)
      .first<{ id: string; email: string; plan: string; role: string; status: string; created_at: number }>()

    if (!user) return c.json({ error: 'Registration failed' }, 500)

    const { token, expiresAt } = await signToken(user.id, c.env.JWT_SECRET)
    await c.env.DB
      .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(token, user.id, expiresAt)
      .run()

    return c.json({ token, user: { id: user.id, email: user.email, plan: user.plan, role: user.role, status: user.status } }, 201)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('UNIQUE')) return c.json({ error: 'Email already registered' }, 409)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }
  const { email, password } = result.data

  const user = await c.env.DB
    .prepare('SELECT id, email, plan, role, status, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string; plan: string; role: string; status: string; password_hash: string }>()

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  if (user.status === 'banned') {
    return c.json({ error: 'Account banned' }, 403)
  }

  const { token, expiresAt } = await signToken(user.id, c.env.JWT_SECRET)
  await c.env.DB
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, user.id, expiresAt)
    .run()
  await c.env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
    .bind(Math.floor(Date.now() / 1000), user.id)
    .run()

  return c.json({ token, user: { id: user.id, email: user.email, plan: user.plan, role: user.role, status: user.status } })
})

auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.slice(7)

  let userId: string
  try {
    userId = await verifyToken(token, c.env.JWT_SECRET)
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const session = await c.env.DB
    .prepare('SELECT expires_at FROM sessions WHERE token = ? AND user_id = ?')
    .bind(token, userId)
    .first<{ expires_at: number }>()

  if (!session || session.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Session expired' }, 401)
  }

  const user = await c.env.DB
    .prepare('SELECT id, email, plan, role, status, pro_expires_at, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string; plan: string; role: string; status: string; pro_expires_at: number | null; created_at: number }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.status === 'banned') return c.json({ error: 'Account banned' }, 403)

  return c.json({ user })
})

export default auth
