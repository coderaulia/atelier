import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  getAdminRevenueAnalytics,
  getAdminUserAnalytics,
  getAdminToolAnalytics,
  type RevenueAnalytics,
  type UserAnalytics,
  type ToolAnalytics,
} from '../../lib/api'
import {
  StatTile,
  ColumnChart,
  HBarChart,
  ChartPanel,
  fmtCompact,
} from './charts'

function fmt(n: number) { return (n / 100).toLocaleString('id-ID') }

export default function Revenue() {
  const [days, setDays] = useState(30)
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null)
  const [users, setUsers] = useState<UserAnalytics | null>(null)
  const [tools, setTools] = useState<ToolAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAdminRevenueAnalytics(days),
      getAdminUserAnalytics(days),
      getAdminToolAnalytics(days),
    ])
      .then(([r, u, t]) => { setRevenue(r); setUsers(u); setTools(t) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [days])

  const proCount = users?.plan_breakdown?.find((p) => p.plan === 'pro')?.count ?? 0

  return (
    <AdminLayout active="revenue">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Analytics</div>
            <h1>Revenue</h1>
            <p>MRR, revenue trends, conversion, churn, and top tools — {days}-day window.</p>
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
                label="MRR"
                value={`IDR ${fmt(revenue?.mrr ?? 0)}`}
                sub="Monthly recurring revenue"
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Total Revenue"
                value={`IDR ${fmt(revenue?.total_revenue ?? 0)}`}
                sub="All-time successful payments"
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Avg Transaction"
                value={`IDR ${fmt(revenue?.avg_transaction ?? 0)}`}
                sub="Per payment average"
              />
            </div>
            <div className="admin-card">
              <StatTile
                label="Pro Users"
                value={fmtCompact(proCount)}
                sub="Current subscribers"
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
                label="Churn Rate"
                value={`${(users?.churn_rate ?? 0).toFixed(1)}%`}
                sub="Cancelled / total Pro"
              />
            </div>
          </div>

          {/* Charts */}
          <div className="admin-grid-2">
            <ChartPanel title="Revenue trend" subtitle={`· ${days} days`}>
              <ColumnChart
                data={(revenue?.trend ?? []).map(row => ({
                  label: row.date.slice(5),
                  value: row.revenue,
                  tooltip: `${row.date}: IDR ${fmt(row.revenue)}`,
                }))}
                formatValue={(v) => `IDR ${fmt(v)}`}
                emptyText="No revenue data yet"
              />
            </ChartPanel>

            <ChartPanel title="Daily signups" subtitle={`· ${days} days`}>
              <ColumnChart
                data={(users?.signups ?? []).map(row => ({
                  label: row.date.slice(5),
                  value: row.count,
                  tooltip: `${row.date}: ${row.count} signups`,
                }))}
                color="var(--viz-series-2, #1baf7a)"
                emptyText="No signups yet"
              />
            </ChartPanel>
          </div>

          {/* Top tools */}
          {tools?.top_tools?.length ? (
            <ChartPanel title="Top tools" subtitle={`· ${days} days`} style={{ marginTop: 18 }}>
              <HBarChart
                data={tools.top_tools.map(t => ({
                  label: t.tool_id,
                  value: t.total_uses,
                  sub: `(${t.unique_users} users)`,
                }))}
                formatValue={(v) => v.toLocaleString()}
              />
            </ChartPanel>
          ) : null}
        </div>
      </section>
    </AdminLayout>
  )
}
