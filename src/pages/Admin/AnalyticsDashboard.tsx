import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  getAdminRevenueAnalytics,
  getAdminUserAnalytics,
  getAdminToolAnalytics,
  getAdminGeoAnalytics,
  type RevenueAnalytics,
  type UserAnalytics,
  type ToolAnalytics,
  type GeoAnalytics,
} from '../../lib/api'
import {
  StatTile,
  ColumnChart,
  HBarChart,
  ChartPanel,
  PlanTiles,
  KeyMetrics,
  fmtCompact,
} from './charts'

function fmt(n: number) { return (n / 100).toLocaleString('id-ID') }

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30)
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null)
  const [users, setUsers] = useState<UserAnalytics | null>(null)
  const [tools, setTools] = useState<ToolAnalytics | null>(null)
  const [geo, setGeo] = useState<GeoAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAdminRevenueAnalytics(days),
      getAdminUserAnalytics(days),
      getAdminToolAnalytics(days),
      getAdminGeoAnalytics(days),
    ])
      .then(([r, u, t, g]) => { setRevenue(r); setUsers(u); setTools(t); setGeo(g) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [days])

  const proCount = users?.plan_breakdown?.find((p) => p.plan === 'pro')?.count ?? 0
  const freeCount = users?.plan_breakdown?.find((p) => p.plan === 'free')?.count ?? 0
  const totalSignups = users?.signups?.reduce((sum, day) => sum + day.count, 0) ?? 0
  const totalUsage = tools?.daily_usage?.reduce((sum, day) => sum + day.total, 0) ?? 0

  return (
    <AdminLayout active="analytics">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Analytics</div>
            <h1>Dashboard</h1>
            <p>Users, revenue, conversions, and tool usage — {days}-day window.</p>
          </div>
          <div className="admin-pill-group">
            {[7, 30, 60, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} className={days === d ? 'active' : ''}>{d}d</button>
            ))}
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className={loading ? 'viz-loading' : ''}>
          {/* KPI row */}
          <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
            <div className="admin-card">
              <StatTile
                label="Total Users"
                value={fmtCompact(users?.total_users ?? 0)}
                sub={`${proCount} Pro, ${freeCount} Free`}
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="MRR"
                value={`IDR ${fmt(revenue?.mrr ?? 0)}`}
                sub="Monthly recurring"
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Conversion"
                value={`${(users?.conversion_rate ?? 0).toFixed(1)}%`}
                sub="Free → Pro rate"
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Churn"
                value={`${(users?.churn_rate ?? 0).toFixed(1)}%`}
                sub="Cancelled / Pro"
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Signups"
                value={fmtCompact(totalSignups)}
                sub={`Last ${days} days`}
                spark={users?.signups?.map(d => d.count)}
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Tool Uses"
                value={fmtCompact(totalUsage)}
                sub={`Last ${days} days`}
                spark={tools?.daily_usage?.map(d => d.total)}
              />
            </div>
          </div>

          {/* Time-series charts */}
          <div className="admin-grid-2">
            <ChartPanel title="Daily Signups" subtitle={`· ${days}d`}>
              <ColumnChart
                data={(users?.signups ?? []).map(row => ({
                  label: row.date.slice(5),
                  value: row.count,
                  tooltip: `${row.date}: ${row.count} signups`,
                }))}
                emptyText="No data"
              />
            </ChartPanel>

            <ChartPanel title="Daily Tool Usage" subtitle={`· ${days}d`}>
              <ColumnChart
                data={(tools?.daily_usage ?? []).map(row => ({
                  label: row.date.slice(5),
                  value: row.total,
                  tooltip: `${row.date}: ${row.total} uses`,
                }))}
                color="var(--viz-series-2, #1baf7a)"
                emptyText="No data"
              />
            </ChartPanel>
          </div>

          {/* Top tools */}
          <ChartPanel title="Top Tools" subtitle={`· ${days}d`} style={{ marginTop: 18 }}>
            <HBarChart
              data={(tools?.top_tools?.slice(0, 5) ?? []).map(t => ({
                label: t.tool_id,
                value: t.total_uses,
                sub: `(${t.unique_users} users)`,
              }))}
              formatValue={(v) => v.toLocaleString()}
              emptyText="No data"
            />
          </ChartPanel>

          {/* Bottom row: Plan + Geo + Key metrics */}
          <div className="admin-grid-2" style={{ marginTop: 18 }}>
            <ChartPanel title="Plan Distribution">
              <PlanTiles data={users?.plan_breakdown ?? []} />
            </ChartPanel>

            <ChartPanel title="Geo Distribution">
              <HBarChart
                data={(geo?.geo?.slice(0, 8) ?? []).map(g => ({
                  label: g.country_code,
                  value: g.unique_users,
                  sub: 'users',
                }))}
                labelWidth={60}
                emptyText="No geo data yet"
              />
            </ChartPanel>
          </div>

          <ChartPanel title="Key Metrics" style={{ marginTop: 18 }}>
            <KeyMetrics data={[
              { label: 'Total Revenue', value: `IDR ${fmt(revenue?.total_revenue ?? 0)}` },
              { label: 'Avg Transaction', value: `IDR ${fmt(revenue?.avg_transaction ?? 0)}` },
              { label: 'Conversion Rate', value: `${(users?.conversion_rate ?? 0).toFixed(2)}%` },
              { label: 'Churn Rate', value: `${(users?.churn_rate ?? 0).toFixed(2)}%` },
            ]} />
          </ChartPanel>
        </div>
      </section>
    </AdminLayout>
  )
}
