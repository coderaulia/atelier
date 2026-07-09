import { Hono } from 'hono'
import { authMiddleware, type AuthVariables } from '../middleware/auth'
import { checkRateLimit, getClientIP } from '../lib/rate-limit'
import { TIER_LIMITS, type ProTier } from '../lib/pricing'
import type { Bindings } from '../types'

// Usage limits per user type
const FREE_DAILY_LIMIT = 3 // Registered free: tight limit to create upgrade pressure

// Pro daily limit depends on subscription tier; legacy pro users with no
// tier set (pre-tiers) default to the mid 'pro' tier limit.
function proDailyLimit(proTier: ProTier | null): number {
  return TIER_LIMITS[proTier ?? 'pro']
}

// Tools that don't consume credits (always free)
const FREE_TOOLS = new Set(['pdf-merge', 'pdf-compress', 'image-converter'])

// Credit packs are scoped to a specific tool — a CV pack cannot pay for a social export.
const TOOL_PACK_TYPE: Record<string, string> = {
  'cv-builder': 'cv-10',
  'social-generator': 'social-50',
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

function resetAt(): number {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}


// ─── Daily limit logic (shared between POST and credit-fallback) ──────

async function applyDailyLimit(
  db: D1Database,
  userId: string,
  toolId: string,
  date: string,
  limit: number,
  plan: string,
): Promise<Response> {
  await db
    .prepare(
      'INSERT OR IGNORE INTO usage_log (user_id, tool_id, date, count, limit_hits) VALUES (?, ?, ?, 0, 0)'
    )
    .bind(userId, toolId, date)
    .run()

  const updated = await db
    .prepare(
      'UPDATE usage_log SET count = count + 1 WHERE user_id = ? AND tool_id = ? AND date = ? AND count < ? RETURNING count'
    )
    .bind(userId, toolId, date, limit)
    .first<{ count: number }>()

  if (!updated) {
    const row = await db
      .prepare(
        `UPDATE usage_log SET limit_hits = limit_hits + 1
         WHERE user_id = ? AND tool_id = ? AND date = ?
         RETURNING count`
      )
      .bind(userId, toolId, date)
      .first<{ count: number }>()

    return new Response(
      JSON.stringify({
        error: 'Daily limit reached',
        limit,
        used: row?.count ?? limit,
        reset_at: resetAt(),
        has_watermark: plan !== 'pro',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      used: updated.count,
      limit,
      reset_at: resetAt(),
      has_watermark: plan !== 'pro',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

const usage = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>()

usage.use('*', authMiddleware)
usage.use('*', async (c, next) => {
  const ip = getClientIP(c)
  const limit = await checkRateLimit(c.env.DB, `usage:${c.var.userId}:${ip}`, 60, 60)
  if (!limit.allowed) return c.json({ error: 'Too many usage requests', reset_at: limit.resetAt }, 429)
  await next()
})

// GET /usage/me — user's usage history
usage.get('/me', async (c) => {
  const userId = c.get('userId')
  const plan = c.get('plan')
  const proTier = c.get('proTier')
  const since30 = new Date()
  since30.setUTCDate(since30.getUTCDate() - 30)
  const sinceStr = since30.toISOString().slice(0, 10)

  const rows = await c.env.DB
    .prepare(
      `SELECT date, tool_id, count,
        CASE WHEN ? = 'pro' THEN ? ELSE ? END AS limit_val
       FROM usage_log
       WHERE user_id = ? AND date >= ?
       ORDER BY date DESC, tool_id ASC`
    )
    .bind(plan, proDailyLimit(proTier), FREE_DAILY_LIMIT, userId, sinceStr)
    .all()

  return c.json({
    usage: (rows.results ?? []).map((r: any) => ({
      date: r.date,
      tool_id: r.tool_id,
      count: r.count,
      limit: r.limit_val,
    })),
  })
})

// GET /usage/:toolId — check current usage and limits
usage.get('/:toolId', async (c) => {
  const toolId = c.req.param('toolId')
  const userId = c.get('userId')
  const plan = c.get('plan')
  const proTier = c.get('proTier')
  const date = todayUTC()

  // Free tools: no limits, no watermark
  if (FREE_TOOLS.has(toolId)) {
    return c.json({
      used: 0,
      limit: null,
      reset_at: resetAt(),
      has_watermark: false,
    })
  }

  // Check available credits from packs scoped to this tool
  const packType = TOOL_PACK_TYPE[toolId]
  const creditPacks = packType
    ? await c.env.DB
        .prepare(
          `SELECT id, pack_type, credits_total, credits_used
           FROM credit_packs
           WHERE user_id = ? AND pack_type = ? AND credits_used < credits_total
           ORDER BY purchased_at ASC`
        )
        .bind(userId, packType)
        .all<{ id: number; pack_type: string; credits_total: number; credits_used: number }>()
    : { results: [] }

  const totalCredits = (creditPacks.results ?? []).reduce(
    (sum, pack) => sum + (pack.credits_total - pack.credits_used),
    0
  )

  // If user has credits, they can use without watermark
  if (totalCredits > 0) {
    return c.json({
      used: 0,
      limit: null,
      reset_at: resetAt(),
      has_watermark: false,
      credits_available: totalCredits,
    })
  }

  // Pro users: generous daily limit, no watermark
  if (plan === 'pro') {
    const row = await c.env.DB
      .prepare('SELECT count FROM usage_log WHERE user_id = ? AND tool_id = ? AND date = ?')
      .bind(userId, toolId, date)
      .first<{ count: number }>()

    return c.json({
      used: row?.count ?? 0,
      limit: proDailyLimit(proTier),
      reset_at: resetAt(),
      has_watermark: false,
    })
  }

  // Free users: tight daily limit, with watermark
  const row = await c.env.DB
    .prepare('SELECT count FROM usage_log WHERE user_id = ? AND tool_id = ? AND date = ?')
    .bind(userId, toolId, date)
    .first<{ count: number }>()

  return c.json({
    used: row?.count ?? 0,
    limit: FREE_DAILY_LIMIT,
    reset_at: resetAt(),
    has_watermark: true,
  })
})

// POST /usage/:toolId — increment usage
usage.post('/:toolId', async (c) => {
  const toolId = c.req.param('toolId')
  const userId = c.get('userId')
  const plan = c.get('plan')
  const proTier = c.get('proTier')
  const date = todayUTC()

  // Free tools: always allow
  if (FREE_TOOLS.has(toolId)) {
    return c.json({
      used: 0,
      limit: null,
      reset_at: resetAt(),
      has_watermark: false,
    })
  }

  // Try to use credits first (priority: oldest pack first), scoped to this tool
  const packType = TOOL_PACK_TYPE[toolId]
  const creditPack = packType
    ? await c.env.DB
        .prepare(
          `SELECT id
           FROM credit_packs
           WHERE user_id = ? AND pack_type = ? AND credits_used < credits_total
           ORDER BY purchased_at ASC
           LIMIT 1`
        )
        .bind(userId, packType)
        .first<{ id: number }>()
    : null

  if (creditPack) {
    // Atomic deduction: only succeed if credits remain (race-safe)
    const deducted = await c.env.DB
      .prepare(
        `UPDATE credit_packs SET credits_used = credits_used + 1
         WHERE id = ? AND credits_used < credits_total
         RETURNING credits_total, credits_used`
      )
      .bind(creditPack.id)
      .first<{ credits_total: number; credits_used: number }>()

    if (deducted) {
      // Log credit usage
      await c.env.DB
        .prepare(
          'INSERT INTO credit_usage (user_id, pack_id, tool_id, credits_spent) VALUES (?, ?, ?, 1)'
        )
        .bind(userId, creditPack.id, toolId)
        .run()

      const remaining = deducted.credits_total - deducted.credits_used

      return c.json({
        used: 0,
        limit: null,
        reset_at: resetAt(),
        has_watermark: false,
        credits_available: remaining,
      })
    }
    // Race: last credit consumed by concurrent request. Fall through to daily limit.
  }

  // No credits (or race consumed them): use daily limit
  const limit = plan === 'pro' ? proDailyLimit(proTier) : FREE_DAILY_LIMIT
  return await applyDailyLimit(c.env.DB, userId, toolId, date, limit, plan)
})

export default usage
