import { Hono } from 'hono'
import { z } from 'zod'
import { signToken, verifyToken } from '../lib/jwt'
import { hashPassword, verifyPassword } from '../lib/password'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import { randomToken, sha256Hex } from '../lib/tokens'
import { sendEmail, emailTemplates } from '../lib/email'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import { getAppUrl } from '../lib/config'
import type { Bindings } from '../types'

const auth = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

const deleteAccountSchema = z.object({
  confirm: z.literal('DELETE'),
})

// ─── POST /register ───────────────────────────────────────────────
auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid email or password (min 8 chars)' }, 400)
  }
  const { email, password } = result.data
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `register:${ip}`, 60, 5)
  if (!limit.allowed) {
    return c.json({ error: 'Too many registration attempts', reset_at: limit.resetAt }, 429)
  }

  const password_hash = await hashPassword(password)

  try {
    const user = await c.env.DB
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id, email, plan, role, status, created_at')
      .bind(email, password_hash)
      .first<{ id: string; email: string; plan: string; role: string; status: string; created_at: number }>()

    if (!user) return c.json({ error: 'Registration failed' }, 500)

    const { token, expiresAt } = await signToken(user.id, c.env.JWT_SECRET)
    const tokenHash = await sha256Hex(token)
    await c.env.DB
      .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(tokenHash, user.id, expiresAt)
      .run()

    // Send verification email
    const verifyToken = randomToken()
    const verifyHash = await sha256Hex(verifyToken)
    const verifyExpires = Math.floor(Date.now() / 1000) + 86400 // 24h
    await c.env.DB
      .prepare('INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
      .bind(user.id, verifyHash, verifyExpires)
      .run()

    const baseUrl = getAppUrl(c.env.APP_URL)
    const lang = c.req.header('Accept-Language')?.startsWith('id') ? 'id' : 'en'
    const t = emailTemplates(lang)
    sendEmail({ to: email, subject: t.verifySubject, html: t.verifyBody(verifyToken, baseUrl) }, c.env.RESEND_API_KEY).catch(() => {})

    return c.json({ token, user: { id: user.id, email: user.email, plan: user.plan, role: user.role, status: user.status, email_verified: 0 } }, 201)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('UNIQUE')) return c.json({ error: 'Email already registered' }, 409)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// ─── POST /login ──────────────────────────────────────────────────
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }
  const { email, password } = result.data
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `login:${ip}`, 60, 10)
  if (!limit.allowed) {
    return c.json({ error: 'Too many login attempts', reset_at: limit.resetAt }, 429)
  }

  const now = Math.floor(Date.now() / 1000)
  const lockWindow = now - 3600
  await c.env.DB.prepare('DELETE FROM failed_logins WHERE attempted_at <= ?').bind(lockWindow).run()
  const failed = await c.env.DB
    .prepare('SELECT COUNT(*) AS count FROM failed_logins WHERE email = ? AND attempted_at > ?')
    .bind(email.toLowerCase(), lockWindow)
    .first<{ count: number }>()
  if ((failed?.count ?? 0) >= 10) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const user = await c.env.DB
    .prepare('SELECT id, email, plan, role, status, password_hash, email_verified, deleted_at FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string; plan: string; role: string; status: string; password_hash: string; email_verified: number; deleted_at: number | null }>()

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await c.env.DB
      .prepare('INSERT INTO failed_logins (email, ip_address, attempted_at) VALUES (?, ?, ?)')
      .bind(email.toLowerCase(), ip, now)
      .run()
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  if (user.status === 'banned') {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  if (user.deleted_at) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const { token, expiresAt } = await signToken(user.id, c.env.JWT_SECRET)
  const tokenHash = await sha256Hex(token)
  await c.env.DB
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, user.id, expiresAt)
    .run()
  await c.env.DB.prepare('DELETE FROM failed_logins WHERE email = ?').bind(email.toLowerCase()).run()
  await c.env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
    .bind(Math.floor(Date.now() / 1000), user.id)
    .run()

  return c.json({ token, user: { id: user.id, email: user.email, plan: user.plan, role: user.role, status: user.status, email_verified: user.email_verified } })
})

// ─── GET /me ──────────────────────────────────────────────────────
auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.slice(7)

  let userId: string
  try {
    userId = await verifyToken(token, c.env.JWT_SECRET, c.env.JWT_SECRET_OLD)
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const session = await c.env.DB
    .prepare('SELECT expires_at FROM sessions WHERE token = ? AND user_id = ?')
    .bind(await sha256Hex(token), userId)
    .first<{ expires_at: number }>()

  if (!session || session.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'Session expired' }, 401)
  }

  const user = await c.env.DB
    .prepare('SELECT id, email, plan, role, status, pro_expires_at, cancel_at_period_end, grace_until, email_verified, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string; plan: string; role: string; status: string; pro_expires_at: number | null; cancel_at_period_end: number; grace_until: number | null; email_verified: number; created_at: number }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.status === 'banned') return c.json({ error: 'Account banned' }, 403)

  return c.json({ user })
})

// ─── POST /forgot-password ────────────────────────────────────────
auth.post('/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = forgotPasswordSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid email' }, 400)
  }
  const { email } = result.data
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `forgot-password:${ip}`, 60, 3)
  if (!limit.allowed) {
    return c.json({ error: 'Too many password reset attempts', reset_at: limit.resetAt }, 429)
  }

  const user = await c.env.DB
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string }>()

  // Don't reveal whether account exists
  if (!user) {
    return c.json({ ok: true })
  }

  const token = randomToken()
  const tokenHash = await sha256Hex(token)
  const expiresAt = Math.floor(Date.now() / 1000) + 3600 // 1 hour

  await c.env.DB
    .prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
    .bind(user.id, tokenHash, expiresAt)
    .run()

  const baseUrl = getAppUrl(c.env.APP_URL)
  const lang = c.req.header('Accept-Language')?.startsWith('id') ? 'id' : 'en'
  const t = emailTemplates(lang)
  sendEmail({ to: email, subject: t.resetSubject, html: t.resetBody(token, baseUrl) }, c.env.RESEND_API_KEY).catch(() => {})

  return c.json({ ok: true })
})

// ─── POST /reset-password ─────────────────────────────────────────
auth.post('/reset-password', async (c) => {
  const body = await c.req.json().catch(() => null)
  const result = resetPasswordSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }
  const { token, password } = result.data

  const tokenHash = await sha256Hex(token)
  const now = Math.floor(Date.now() / 1000)

  const row = await c.env.DB
    .prepare('SELECT id, user_id FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > ?')
    .bind(tokenHash, now)
    .first<{ id: number; user_id: string }>()

  if (!row) {
    return c.json({ error: 'Invalid or expired reset token' }, 400)
  }

  const password_hash = await hashPassword(password)

  await c.env.DB
    .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(password_hash, row.user_id)
    .run()

  await c.env.DB
    .prepare('UPDATE password_resets SET used = 1 WHERE id = ?')
    .bind(row.id)
    .run()

  // Invalidate all sessions
  await c.env.DB
    .prepare('DELETE FROM sessions WHERE user_id = ?')
    .bind(row.user_id)
    .run()

  return c.json({ ok: true })
})

// ─── GET /verify-email?token=xxx ──────────────────────────────────
auth.get('/verify-email', async (c) => {
  const token = c.req.query('token')
  if (!token) {
    return c.json({ error: 'Missing token' }, 400)
  }

  const tokenHash = await sha256Hex(token)
  const now = Math.floor(Date.now() / 1000)

  const row = await c.env.DB
    .prepare('SELECT id, user_id FROM email_verifications WHERE token_hash = ? AND used = 0 AND expires_at > ?')
    .bind(tokenHash, now)
    .first<{ id: number; user_id: string }>()

  if (!row) {
    return c.json({ error: 'Invalid or expired verification token' }, 400)
  }

  await c.env.DB
    .prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
    .bind(row.user_id)
    .run()

  await c.env.DB
    .prepare('UPDATE email_verifications SET used = 1 WHERE id = ?')
    .bind(row.id)
    .run()

  return c.redirect(`${getAppUrl(c.env.APP_URL)}/account?verified=1`)
})

// ─── POST /verify-email (send verification) ──────────────────────
auth.post('/verify-email', authMiddleware, async (c) => {
  const userId = c.var.userId
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `verify-email:${ip}`, 60, 3)
  if (!limit.allowed) {
    return c.json({ error: 'Too many verification email requests', reset_at: limit.resetAt }, 429)
  }

  const user = await c.env.DB
    .prepare('SELECT email, email_verified FROM users WHERE id = ?')
    .bind(userId)
    .first<{ email: string; email_verified: number }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.email_verified) return c.json({ error: 'Email already verified' }, 400)

  const token = randomToken()
  const verifyHash = await sha256Hex(token)
  const expiresAt = Math.floor(Date.now() / 1000) + 86400 // 24h

  await c.env.DB
    .prepare('INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
    .bind(userId, verifyHash, expiresAt)
    .run()

  const baseUrl = getAppUrl(c.env.APP_URL)
  const t = emailTemplates('en')
  sendEmail({ to: user.email, subject: t.verifySubject, html: t.verifyBody(token, baseUrl) }, c.env.RESEND_API_KEY).catch(() => {})

  return c.json({ ok: true })
})

// ─── DELETE /account ──────────────────────────────────────────────
auth.delete('/account', authMiddleware, async (c) => {
  const userId = c.var.userId

  const body = await c.req.json().catch(() => null)
  const result = deleteAccountSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Type DELETE to confirm' }, 400)
  }

  const user = await c.env.DB
    .prepare('SELECT email, plan, midtrans_token_id FROM users WHERE id = ?')
    .bind(userId)
    .first<{ email: string; plan: string; midtrans_token_id?: string | null }>()

  if (!user) return c.json({ error: 'User not found' }, 404)

  // Cancel active Midtrans subscription if pro
  if (user.plan === 'pro' && c.env.MIDTRANS_SERVER_KEY) {
    try {
      const authStr = btoa(`${c.env.MIDTRANS_SERVER_KEY}:`)
      const baseUrl = c.env.MIDTRANS_BASE_URL ?? 'https://api.midtrans.com'
      // Stop recurring via Midtrans Core API
      if (user.midtrans_token_id) {
        await fetch(`${baseUrl}/v1/payments/${user.midtrans_token_id}/deny`, {
          method: 'POST',
          headers: { Authorization: `Basic ${authStr}`, 'Content-Type': 'application/json' },
        }).catch(() => {})
      }
    } catch {
      // Non-critical, continue
    }
  }

  // Soft-delete & anonymize
  await c.env.DB
    .prepare('UPDATE users SET deleted_at = ?, email = ?, name = NULL, status = ? WHERE id = ?')
    .bind(Math.floor(Date.now() / 1000), `deleted-${userId}@vanailadigital.com`, 'banned', userId)
    .run()

  // Invalidate sessions
  await c.env.DB
    .prepare('DELETE FROM sessions WHERE user_id = ?')
    .bind(userId)
    .run()

  const t = emailTemplates('en')
  sendEmail({ to: user.email, subject: t.accountDeletionSubject, html: t.accountDeletionBody() }, c.env.RESEND_API_KEY).catch(() => {})

  return c.json({ ok: true })
})

// ─── POST /logout ─────────────────────────────────────────────────
auth.post('/logout', authMiddleware, async (c) => {
  const userId = c.var.userId
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

  // Delete session
  if (token) {
    await c.env.DB
      .prepare('DELETE FROM sessions WHERE token = ? AND user_id = ?')
      .bind(await sha256Hex(token), userId)
      .run()
  }

  return c.json({ ok: true })
})

// ─── PATCH /profile ────────────────────────────────────────────────
auth.patch('/profile', authMiddleware, async (c) => {
  const userId = c.var.userId
  const body = await c.req.json().catch(() => null) as { name?: string | null } | null
  const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim().slice(0, 120) : null

  await c.env.DB
    .prepare('UPDATE users SET name = ? WHERE id = ?')
    .bind(name, userId)
    .run()

  const user = await c.env.DB
    .prepare('SELECT id, email, name, plan, role, status, pro_expires_at, cancel_at_period_end, grace_until, email_verified, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first()

  return c.json({ user })
})

// ─── GET /sessions ─────────────────────────────────────────────────
auth.get('/sessions', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const currentHash = token ? await sha256Hex(token) : ''

  const rows = await c.env.DB
    .prepare('SELECT token, expires_at, last_used, user_agent FROM sessions WHERE user_id = ? ORDER BY last_used DESC')
    .bind(c.var.userId)
    .all<{ token: string; expires_at: number; last_used: number | null; user_agent: string | null }>()

  const sessions = (rows.results ?? []).map((session) => ({
    expires_at: session.expires_at,
    last_used: session.last_used,
    user_agent: session.user_agent,
    current: session.token === currentHash,
  }))

  return c.json({ sessions })
})

// ─── DELETE /sessions/all ──────────────────────────────────────────
auth.delete('/sessions/all', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const currentHash = token ? await sha256Hex(token) : ''

  if (currentHash) {
    await c.env.DB
      .prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?')
      .bind(c.var.userId, currentHash)
      .run()
  }

  return c.json({ ok: true })
})

// ─── POST /change-password ────────────────────────────────────────
auth.post('/change-password', authMiddleware, async (c) => {
  const userId = c.var.userId
  const body = await c.req.json().catch(() => null)
  const result = changePasswordSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }
  const { currentPassword, newPassword } = result.data

  const user = await c.env.DB
    .prepare('SELECT password_hash FROM users WHERE id = ?')
    .bind(userId)
    .first<{ password_hash: string }>()

  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    return c.json({ error: 'Current password is incorrect' }, 401)
  }

  const password_hash = await hashPassword(newPassword)
  await c.env.DB
    .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(password_hash, userId)
    .run()

  return c.json({ ok: true })
})

export default auth
