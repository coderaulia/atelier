import { Hono } from 'hono'
import { adminMiddleware, type AdminVariables } from '../../middleware/admin'
import { getCachedAnalytics } from '../../lib/analytics-cache'
import type { Bindings } from '../../types'

const analyticsAdmin = new Hono<{ Bindings: Bindings; Variables: AdminVariables }>()
analyticsAdmin.use('*', adminMiddleware)

const MAX_ANALYTICS_DAYS = 365

function analyticsDays(raw: string | undefined): number {
  const value = Number(raw ?? 30)
  if (!Number.isFinite(value)) return 30
  return Math.min(MAX_ANALYTICS_DAYS, Math.max(1, Math.floor(value)))
}

analyticsAdmin.get('/revenue', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const monthStartUnix = Math.floor(monthStart.getTime() / 1000)
  const days = analyticsDays(c.req.query('days'))
  const sinceUnix = now - days * 86400

  const analytics = await getCachedAnalytics(c.env.DB, `analytics:revenue:${days}`, async () => {
    const [mrr, trend, totalRevenue, avgTransaction] = await Promise.all([
      c.env.DB.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE status = 'success' AND created_at >= ?").bind(monthStartUnix).first<{ total: number }>(),
      c.env.DB.prepare(`SELECT date(created_at, 'unixepoch') AS date, SUM(amount) AS revenue, COUNT(*) AS count FROM transactions WHERE status = 'success' AND created_at >= ? GROUP BY date ORDER BY date ASC`).bind(sinceUnix).all<{ date: string; revenue: number; count: number }>(),
      c.env.DB.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE status = 'success'").first<{ total: number }>(),
      c.env.DB.prepare("SELECT COALESCE(AVG(amount), 0) AS avg FROM transactions WHERE status = 'success'").first<{ avg: number }>(),
    ])
    return { mrr: mrr?.total ?? 0, total_revenue: totalRevenue?.total ?? 0, avg_transaction: Math.round(avgTransaction?.avg ?? 0), trend: trend.results ?? [] }
  })
  return c.json(analytics)
})

analyticsAdmin.get('/users', async (c) => {
  const now = Math.floor(Date.now() / 1000)
  const days = analyticsDays(c.req.query('days'))
  const sinceUnix = now - days * 86400

  const analytics = await getCachedAnalytics(c.env.DB, `analytics:users:${days}`, async () => {
    const [totalUsers, planBreakdown, signups, conversions, totalPro, cancelled] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NULL').first<{ count: number }>(),
      c.env.DB.prepare("SELECT plan, COUNT(*) AS count FROM users WHERE deleted_at IS NULL GROUP BY plan").all<{ plan: string; count: number }>(),
      c.env.DB.prepare(`SELECT date(created_at, 'unixepoch') AS date, COUNT(*) AS count FROM users WHERE created_at >= ? GROUP BY date ORDER BY date ASC`).bind(sinceUnix).all<{ date: string; count: number }>(),
      c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND created_at >= ?").bind(sinceUnix).first<{ count: number }>(),
      c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro'").first<{ count: number }>(),
      c.env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE plan = 'pro' AND cancel_at_period_end = 1").first<{ count: number }>(),
    ])
    const totalSignups = signups.results?.reduce((sum, day) => sum + day.count, 0) ?? 0
    const conversionRate = totalSignups > 0 ? ((conversions?.count ?? 0) / totalSignups) * 100 : 0
    const churnRate = (totalPro?.count ?? 0) > 0 ? ((cancelled?.count ?? 0) / (totalPro?.count ?? 0)) * 100 : 0
    return { total_users: totalUsers?.count ?? 0, plan_breakdown: planBreakdown.results ?? [], signups: signups.results ?? [], conversion_rate: Math.round(conversionRate * 100) / 100, churn_rate: Math.round(churnRate * 100) / 100 }
  })
  return c.json(analytics)
})

analyticsAdmin.get('/tools', async (c) => {
  const days = analyticsDays(c.req.query('days'))
  const sinceDate = new Date((Math.floor(Date.now() / 1000) - days * 86400) * 1000).toISOString().slice(0, 10)

  const analytics = await getCachedAnalytics(c.env.DB, `analytics:tools:${days}`, async () => {
    const [topTools, dailyUsage] = await Promise.all([
      c.env.DB.prepare(`SELECT tool_id, SUM(count) AS total_uses, COUNT(DISTINCT user_id) AS unique_users FROM usage_log WHERE date >= ? GROUP BY tool_id ORDER BY total_uses DESC LIMIT 10`).bind(sinceDate).all<{ tool_id: string; total_uses: number; unique_users: number }>(),
      c.env.DB.prepare(`SELECT date, SUM(count) AS total FROM usage_log WHERE date >= ? GROUP BY date ORDER BY date ASC`).bind(sinceDate).all<{ date: string; total: number }>(),
    ])
    return { top_tools: topTools.results ?? [], daily_usage: dailyUsage.results ?? [] }
  })
  return c.json(analytics)
})

analyticsAdmin.get('/geo', async (c) => {
  const days = analyticsDays(c.req.query('days'))
  const sinceDate = new Date((Math.floor(Date.now() / 1000) - days * 86400) * 1000).toISOString().slice(0, 10)

  const analytics = await getCachedAnalytics(c.env.DB, `analytics:geo:${days}`, async () => {
    const geoData = await c.env.DB.prepare(
      `SELECT country_code, COUNT(DISTINCT user_id) AS unique_users FROM user_geo_daily
       WHERE date >= ? GROUP BY country_code ORDER BY unique_users DESC LIMIT 20`
    ).bind(sinceDate).all<{ country_code: string; unique_users: number }>()
    return { geo: geoData.results ?? [] }
  })
  return c.json(analytics)
})

export default analyticsAdmin
