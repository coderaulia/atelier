import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  getAdminStats,
  getAdminRevenueAnalytics,
  getAdminUserAnalytics,
  getHealthStatus,
  type AdminStats,
  type RevenueAnalytics,
  type UserAnalytics,
  type HealthStatus,
} from '../../lib/api'
import {
  StatTile,
  ColumnChart,
  HBarChart,
  ChartPanel,
  PlanTiles,
  fmtIDR,
  fmtCompact,
} from './charts'

export default function Overview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminStats().then(setStats).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'))
    getAdminRevenueAnalytics(30).then(setRevenue).catch(() => {})
    getAdminUserAnalytics(30).then(setUserAnalytics).catch(() => {})
    getHealthStatus().then(setHealth).catch(() => {})
  }, [])

  const mostUsedTool = stats?.top_tools?.[0]?.tool_id ?? '—'

  return (
    <AdminLayout active="overview">
      <section className="admin-page">
        <Header title="Overview" subtitle="Usage, revenue, signups, conversion, and system health." />
        {error && <div className="admin-error">{error}</div>}

        {health && (
          <div className="health-strip">
            <span className={`health-dot health-dot--${health.status === 'healthy' ? 'ok' : health.status === 'degraded' ? 'warn' : 'bad'}`} />
            <strong>System {health.status}</strong>
            <span className="health-strip__sep">·</span>
            <span>DB {health.checks.database}</span>
            <span className="health-strip__sep">·</span>
            <span>API {health.checks.api}</span>
            {health.metrics.unread_notifications > 0 && (
              <>
                <span className="health-strip__sep">·</span>
                <span>{health.metrics.unread_notifications} unread notifications</span>
              </>
            )}
          </div>
        )}

        {/* Primary KPIs */}
        <div className="admin-stat-grid">
          <div className="admin-card">
            <StatTile
              label="Total users"
              value={fmtCompact(stats?.total_users ?? 0)}
              spark={stats?.daily_signups?.map(d => d.count)}
            />
          </div>
          <div className="admin-card">
            <StatTile
              label="Pro users"
              value={fmtCompact(stats?.pro_users ?? 0)}
            />
          </div>
          <div className="admin-card">
            <StatTile
              label="Revenue MTD"
              value={fmtIDR(stats?.revenue_this_month ?? 0)}
              spark={revenue?.trend?.map(d => d.revenue)}
            />
          </div>
          <div className="admin-card">
            <StatTile
              label="Most used tool"
              value={mostUsedTool}
            />
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="admin-stat-grid admin-stat-grid--wide">
          <div className="admin-card admin-card--compact">
            <StatTile label="MRR" value={fmtIDR(revenue?.mrr ?? 0)} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Total revenue" value={fmtIDR(revenue?.total_revenue ?? 0)} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Conversion" value={`${userAnalytics?.conversion_rate ?? 0}%`} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Churn" value={`${userAnalytics?.churn_rate ?? 0}%`} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Active 24h" value={String(health?.metrics.active_sessions_24h ?? 0)} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Errors / hr" value={String(health?.metrics.errors_last_hour ?? 0)} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Pending refunds" value={String(health?.metrics.pending_refunds ?? 0)} />
          </div>
          <div className="admin-card admin-card--compact">
            <StatTile label="Signups today" value={String(stats?.users_today ?? 0)} />
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="admin-grid-2">
          <ChartPanel title="Tool completions" subtitle="· 7 days">
            <HBarChart
              data={(stats?.daily_tool_usage ?? []).map(row => ({
                label: `${row.date.slice(5)} · ${row.tool_id}`,
                value: row.count,
              }))}
              emptyText="No usage yet"
            />
          </ChartPanel>

          <ChartPanel title="New signups" subtitle="· 30 days">
            <ColumnChart
              data={(stats?.daily_signups ?? []).map(row => ({
                label: row.date.slice(5),
                value: row.count,
                tooltip: `${row.date}: ${row.count} signups`,
              }))}
              emptyText="No signups yet"
            />
          </ChartPanel>
        </div>

        {/* Charts row 2 */}
        <div className="admin-grid-2" style={{ marginTop: 18 }}>
          <ChartPanel title="Revenue" subtitle="· 30 days">
            <ColumnChart
              data={(revenue?.trend ?? []).map(row => ({
                label: row.date.slice(5),
                value: row.revenue,
                tooltip: `${row.date}: ${fmtIDR(row.revenue)}`,
              }))}
              formatValue={(v) => fmtIDR(v)}
              emptyText="No revenue yet"
            />
          </ChartPanel>

          <ChartPanel title="Plan breakdown">
            <PlanTiles data={userAnalytics?.plan_breakdown ?? []} />
          </ChartPanel>
        </div>
      </section>
    </AdminLayout>
  )
}

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="admin-header">
      <div>
        <div className="eyebrow eyebrow--accent">Internal</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}
