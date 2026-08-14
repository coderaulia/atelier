import { Hono } from 'hono'
import { z } from 'zod'
import { signToken, verifyToken } from '../lib/jwt'
import { hashPassword, needsPasswordRehash, verifyPassword } from '../lib/password'
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

const globalMetadataSchema = z.object({
  company_name: z.string().max(160).optional().nullable(),
  company_address: z.string().max(1000).optional().nullable(),
  username: z.string().max(80).optional().nullable(),
  email: z.string().email().max(254).optional().or(z.literal('')).nullable(),
  profile_image_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  company_logo_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  website: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  social_handle: z.string().max(100).optional().nullable(),
  instagram_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  linkedin_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  x_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  facebook_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  tiktok_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  youtube_url: z.string().url().max(2000).optional().or(z.literal('')).nullable(),
  document_signatory: z.string().max(160).optional().nullable(),
  tax_id: z.string().max(120).optional().nullable(),
  payment_details: z.string().max(1600).optional().nullable(),
}).partial()

const profileSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  global_metadata: globalMetadataSchema.optional().nullable(),
  version: z.number().int().min(1),
})

const deleteAccountSchema = z.object({
  confirm: z.literal('DELETE'),
})

type GlobalMetadata = z.infer<typeof globalMetadataSchema>

function parseGlobalMetadata(value: string | null | undefined): GlobalMetadata | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    const result = globalMetadataSchema.safeParse(parsed)
    return result.success ? normalizeGlobalMetadata(result.data) : null
  } catch {
    return null
  }
}

function normalizeGlobalMetadata(value: GlobalMetadata | null | undefined): GlobalMetadata {
  const normalized: Record<string, string> = {}
  const fields = Object.keys(globalMetadataSchema.shape) as Array<keyof GlobalMetadata>
  for (const field of fields) {
    const raw = value?.[field]
    normalized[field] = typeof raw === 'string' ? raw.trim() : ''
  }
  return normalized as GlobalMetadata
}

function withParsedGlobalMetadata<T extends { global_metadata?: string | null }>(user: T) {
  return {
    ...user,
    global_metadata: parseGlobalMetadata(user.global_metadata),
  }
}

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

  let password_hash: string
  try {
    password_hash = await hashPassword(password)
  } catch (err) {
    console.error('Password hashing failed during registration', err)
    return c.json({ error: 'Registration failed' }, 500)
  }

  try {
    const userId = crypto.randomUUID()
    const { token, expiresAt } = await signToken(userId, c.env.JWT_SECRET)
    const tokenHash = await sha256Hex(token)
    const verifyToken = randomToken()
    const verifyHash = await sha256Hex(verifyToken)
    const verifyExpires = Math.floor(Date.now() / 1000) + 86400 // 24h

    // The account, its usable session, and its verification token form one
    // unit. A partial registration otherwise leaves an email that cannot retry.
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
        .bind(userId, email, password_hash),
      c.env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
        .bind(tokenHash, userId, expiresAt),
      c.env.DB.prepare('INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
        .bind(userId, verifyHash, verifyExpires),
    ])

    const baseUrl = getAppUrl(c.env.APP_URL)
    const lang = c.req.header('Accept-Language')?.startsWith('id') ? 'id' : 'en'
    const t = emailTemplates(lang)
    sendEmail({ to: email, subject: t.verifySubject, html: t.verifyBody(verifyToken, baseUrl) }, c.env.BREVO_API_KEY).catch(() => {})

    return c.json({ token, user: { id: userId, email, plan: 'free', role: 'user', status: 'active', version: 1, email_verified: 0, global_metadata: null } }, 201)
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
    .prepare('SELECT id, email, name, global_metadata, plan, role, status, password_hash, email_verified, deleted_at FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; email: string; name: string | null; global_metadata: string | null; plan: string; role: string; status: string; password_hash: string; email_verified: number; deleted_at: number | null }>()

  let passwordOk = false
  if (user) {
    try {
      passwordOk = await verifyPassword(password, user.password_hash)
    } catch (err) {
      console.error('Password verification failed during login', err)
      return c.json({ error: 'Login failed' }, 500)
    }
  }

  if (!user || !passwordOk) {
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

  if (needsPasswordRehash(user.password_hash)) {
    const currentHash = user.password_hash
    const userId = user.id
    // Rehashing is a background upgrade, never a reason to fail a valid login.
    const upgrade = (async () => {
      const upgradedHash = await hashPassword(password)
      // Do not restore an old password if it was changed while this login was
      // deriving the stronger hash.
      await c.env.DB.prepare(
        'UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ? AND password_hash = ?'
      ).bind(upgradedHash, userId, currentHash).run()
    })().catch((err) => {
      console.error('Password rehash failed during login', err)
    })
    try {
      c.executionCtx.waitUntil(upgrade)
    } catch {
      // No execution context (e.g. tests) — the upgrade already runs detached.
    }
  }

  let token: string
  try {
    const signed = await signToken(user.id, c.env.JWT_SECRET)
    token = signed.token
    const tokenHash = await sha256Hex(token)
    await c.env.DB
      .prepare('INSERT OR REPLACE INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(tokenHash, user.id, signed.expiresAt)
      .run()
  } catch (err) {
    console.error('Session creation failed during login', err)
    return c.json({ error: 'Login failed' }, 500)
  }

  // Bookkeeping only: a failure here must not invalidate the issued session.
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM failed_logins WHERE email = ?').bind(email.toLowerCase()),
    c.env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(Math.floor(Date.now() / 1000), user.id),
  ]).catch((err) => {
    console.error('Post-login bookkeeping failed', err)
  })

  return c.json({ token, user: withParsedGlobalMetadata({ id: user.id, email: user.email, name: user.name, global_metadata: user.global_metadata, plan: user.plan, role: user.role, status: user.status, email_verified: user.email_verified }) })
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
    .prepare('SELECT id, email, name, global_metadata, plan, pro_tier, role, status, pro_expires_at, cancel_at_period_end, grace_until, email_verified, version, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string; name: string | null; global_metadata: string | null; plan: string; pro_tier: string | null; role: string; status: string; pro_expires_at: number | null; cancel_at_period_end: number; grace_until: number | null; email_verified: number; version: number; created_at: number }>()

  if (!user) return c.json({ error: 'User not found' }, 404)
  if (user.status === 'banned') return c.json({ error: 'Account banned' }, 403)

  return c.json({ user: withParsedGlobalMetadata(user) })
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
  sendEmail({ to: email, subject: t.resetSubject, html: t.resetBody(token, baseUrl) }, c.env.BREVO_API_KEY).catch(() => {})

  return c.json({ ok: true })
})

// ─── POST /reset-password ─────────────────────────────────────────
auth.post('/reset-password', async (c) => {
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `reset-password:${ip}`, 60, 5)
  if (!limit.allowed) {
    return c.json({ error: 'Too many password reset attempts', reset_at: limit.resetAt }, 429)
  }

  const body = await c.req.json().catch(() => null)
  const result = resetPasswordSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }
  const { token, password } = result.data

  const tokenHash = await sha256Hex(token)
  const now = Math.floor(Date.now() / 1000)

  const row = await c.env.DB
    .prepare(
      `UPDATE password_resets SET used = 1
       WHERE token_hash = ? AND used = 0 AND expires_at > ?
       RETURNING id, user_id`
    )
    .bind(tokenHash, now)
    .first<{ id: number; user_id: string }>()

  if (!row) {
    return c.json({ error: 'Invalid or expired reset token' }, 400)
  }

  const password_hash = await hashPassword(password)

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ?')
      .bind(password_hash, row.user_id),
    c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(row.user_id),
  ])

  return c.json({ ok: true })
})

// ─── GET /verify-email?token=xxx ──────────────────────────────────
auth.get('/verify-email', async (c) => {
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `verify-email-get:${ip}`, 60, 10)
  if (!limit.allowed) {
    return c.json({ error: 'Too many verification attempts', reset_at: limit.resetAt }, 429)
  }

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
  sendEmail({ to: user.email, subject: t.verifySubject, html: t.verifyBody(token, baseUrl) }, c.env.BREVO_API_KEY).catch(() => {})

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
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10_000)
        try {
          await fetch(`${baseUrl}/v1/payments/${user.midtrans_token_id}/deny`, {
            method: 'POST',
            headers: { Authorization: `Basic ${authStr}`, 'Content-Type': 'application/json' },
            signal: controller.signal,
          })
        } catch {
          // Account deletion continues if the upstream cancellation is unavailable.
        } finally {
          clearTimeout(timeout)
        }
      }
    } catch {
      // Non-critical, continue
    }
  }

  // Soft-delete & anonymize
  await c.env.DB
    .prepare('UPDATE users SET deleted_at = ?, email = ?, name = NULL, global_metadata = NULL, status = ? WHERE id = ?')
    .bind(Math.floor(Date.now() / 1000), `deleted-${userId}@vanailadigital.com`, 'banned', userId)
    .run()

  // Invalidate sessions
  await c.env.DB
    .prepare('DELETE FROM sessions WHERE user_id = ?')
    .bind(userId)
    .run()

  const t = emailTemplates('en')
  sendEmail({ to: user.email, subject: t.accountDeletionSubject, html: t.accountDeletionBody() }, c.env.BREVO_API_KEY).catch(() => {})

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
  const body = await c.req.json().catch(() => null)
  const result = profileSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid profile data' }, 400)
  }

  const name = typeof result.data.name === 'string' && result.data.name.trim() ? result.data.name.trim().slice(0, 120) : null
  const globalMetadata = result.data.global_metadata === undefined
    ? undefined
    : JSON.stringify(normalizeGlobalMetadata(result.data.global_metadata))

  const profileUpdated = globalMetadata === undefined
    ? await c.env.DB
      .prepare('UPDATE users SET name = ?, version = version + 1 WHERE id = ? AND version = ? RETURNING id')
      .bind(name, userId, result.data.version)
      .first<{ id: string }>()
    : await c.env.DB
      .prepare('UPDATE users SET name = ?, global_metadata = ?, version = version + 1 WHERE id = ? AND version = ? RETURNING id')
      .bind(name, globalMetadata, userId, result.data.version)
      .first<{ id: string }>()
  if (!profileUpdated) {
    return c.json({ error: 'Profile changed in another session; refresh and retry' }, 409)
  }

  const user = await c.env.DB
    .prepare('SELECT id, email, name, global_metadata, plan, pro_tier, role, status, pro_expires_at, cancel_at_period_end, grace_until, email_verified, version, created_at FROM users WHERE id = ?')
    .bind(userId)
    .first()

  if (!user) return c.json({ error: 'User not found' }, 404)

  return c.json({ user: withParsedGlobalMetadata(user as { global_metadata?: string | null }) })
})

// ─── GET /sessions ─────────────────────────────────────────────────
auth.get('/sessions', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const currentHash = token ? await sha256Hex(token) : ''

  const rows = await c.env.DB
    .prepare('SELECT token, expires_at, last_used, user_agent FROM sessions WHERE user_id = ? ORDER BY last_used DESC LIMIT 100')
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
  const updated = await c.env.DB
    .prepare('UPDATE users SET password_hash = ?, version = version + 1 WHERE id = ? AND password_hash = ? RETURNING id')
    .bind(password_hash, userId, user.password_hash)
    .first<{ id: string }>()
  if (!updated) return c.json({ error: 'Password changed in another session; retry with the new password' }, 409)

  return c.json({ ok: true })
})

export default auth
