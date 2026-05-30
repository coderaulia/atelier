import { Hono } from 'hono'
import { z } from 'zod'
import { verifyToken } from '../lib/jwt'
import { sha256Hex } from '../lib/tokens'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import type { Bindings } from '../types'

const bugReports = new Hono<{ Bindings: Bindings }>()

const createBugReportSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  tool_id: z.string().optional(),
  screenshot_url: z.string().url().optional(),
})

// Public endpoint - authenticated users can submit bug reports
bugReports.post('/', async (c) => {
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
    .prepare('SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?')
    .bind(await sha256Hex(token), Math.floor(Date.now() / 1000))
    .first<{ user_id: string }>()

  if (!session) {
    return c.json({ error: 'Session expired' }, 401)
  }

  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `bug-report:${ip}`, 60, 5)
  if (!limit.allowed) {
    return c.json({ error: 'Too many bug report submissions', reset_at: limit.resetAt }, 429)
  }

  const user = await c.env.DB
    .prepare('SELECT email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ email: string }>()

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const body = await c.req.json().catch(() => null)
  const result = createBugReportSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid bug report data', details: result.error.issues }, 400)
  }

  const id = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)
  const userAgent = c.req.header('User-Agent') ?? ''

  await c.env.DB
    .prepare(
      `INSERT INTO bug_reports (id, user_id, email, subject, description, tool_id, screenshot_url, user_agent, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      userId,
      user.email,
      result.data.subject,
      result.data.description,
      result.data.tool_id ?? null,
      result.data.screenshot_url ?? null,
      userAgent,
      'app',
      now,
      now
    )
    .run()

  // Create admin notification
  await c.env.DB
    .prepare(
      `INSERT INTO admin_notifications (id, type, title, message, severity, link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      crypto.randomUUID(),
      'bug_report',
      'New Bug Report',
      `${user.email} reported: ${result.data.subject}`,
      'info',
      `/admin/bug-reports/${id}`,
      now
    )
    .run()

  return c.json({ id, message: 'Bug report submitted successfully' }, 201)
})

export default bugReports
