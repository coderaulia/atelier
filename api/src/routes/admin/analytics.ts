import { Hono } from 'hono'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import type { Bindings } from '../../types'

const analyticsAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
analyticsAdmin.use('*', adminMiddleware)

// Revenue analytics
analyticsAdmin.get('/revenue', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const monthStartUnix = Math.floor(monthStart.getTime() / 1000)

  const days = Number(c.req.query('days') ?? 30)
  const sinceUnix = now - days * 86400

  // MRR - Monthly Recurring Revenue (successful transactions this month)
  const mrr = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE status = 'success' AND created_at >= ?"
  )
    .bind(monthStartUnix)
    .first<{ total: number }>()

  // Revenue trend (daily breakdown)
  const trend = await c.env.DB.prepare(
    `SELECT date(created_at, 'unixepoch') AS date, SUM(amount) AS revenue, COUNT(*) AS count
     FROM transactions
     WHERE status = 'success' AND created_at >= ?
     GROUP BY date
     ORDER BY date ASC`
  )
    .bind(sinceUnix)
    .all<{ date: string; revenue: number; count: number }>()

  // Total revenue all time
  const totalRevenue = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE status = 'success'"
  ).first<{ total: number }>()

  // Average transaction value
  const avgTransaction = await c.env.DB.prepare(
    "SELECT COALESCE(AVG(amount), 0) AS avg FROM transactions WHERE status = 'success'"
  ).first<{ avg: number }>()

  return c.json({
    mrr: mrr?.total ?? 0,
    total_revenue: totalRevenue?.total ?? 0,
    avg_transaction: Math.round(avgTransaction?.avg ?? 0),
    trend: trend.results ?? [],
  })
})

// User analytics
analyticsAdmin.get('/users', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const days = Number(c.req.query('days') ?? 30)
  const sinceUnix = now - days * 86400

  // Total users
  const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NULL').first<{ count: number }>()

  // Pro vs Free breakdown
  const planBreakdown = await c.env.DB.prepare(
    "SELECT plan, COUNT(*) AS count FROM users WHERE deleted_at IS NULL GROUP BY plan"
  ).all<{ plan: string; count: number }>()

  // Daily signups
  const signups = await c.env.DB.prepare(
    `SELECT date(created_at, 'unixepoch') AS date, COUNT(*) AS count
     FROM users
     WHERE created_at >= ?
     GROUP BY date
     ORDER BY date ASC`
  )
    .bind(sinceUnix)
    .all<{ date: string; count: number }>()

  // Conversion rate (free → pro)
  const conversions = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND created_at >= ?"
  )
    .bind(sinceUnix)
    .first<{ count: number }>()

  const totalSignups = signups.results?.reduce((sum, day) => sum + day.count, 0) ?? 0
  const conversionRate = totalSignups > 0 ? ((conversions?.count ?? 0) / totalSignups) * 100 : 0

  // Churn rate (cancelled subscriptions / total pro users)
  const [totalPro, cancelled] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND cancel_at_period_end = 1").first<{ count: number }>(),
  ])

  const churnRate = (totalPro?.count ?? 0) > 0 ? ((cancelled?.count ?? 0) / (totalPro?.count ?? 0)) * 100 : 0

  return c.json({
    total_users: totalUsers?.count ?? 0,
    plan_breakdown: planBreakdown.results ?? [],
    signups: signups.results ?? [],
    conversion_rate: Math.round(conversionRate * 100) / 100,
    churn_rate: Math.round(churnRate * 100) / 100,
  })
})

// Tool usage analytics
analyticsAdmin.get('/tools', async (c) => {
  const days = Number(c.req.query('days') ?? 30)
  const now = Math.floor(Date.now() / 1000)
  const since = now - days * 86400
  const sinceDate = new Date(since * 1000).toISOString().slice(0, 10)

  // Most used tools
  const topTools = await c.env.DB.prepare(
    `SELECT tool_id, SUM(count) AS total_uses, COUNT(DISTINCT user_id) AS unique_users
     FROM usage_log
     WHERE date >= ?
     GROUP BY tool_id
     ORDER BY total_uses DESC
     LIMIT 10`
  )
    .bind(sinceDate)
    .all<{ tool_id: string; total_uses: number; unique_users: number }>()

  // Daily tool usage trend
  const dailyUsage = await c.env.DB.prepare(
    `SELECT date, SUM(count) AS total
     FROM usage_log
     WHERE date >= ?
     GROUP BY date
     ORDER BY date ASC`
  )
    .bind(sinceDate)
    .all<{ date: string; total: number }>()

  return c.json({
    top_tools: topTools.results ?? [],
    daily_usage: dailyUsage.results ?? [],
  })
})

export default analyticsAdmin
