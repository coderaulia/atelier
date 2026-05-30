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

  const kpis = [
    { label: 'Total Users', value: users?.total_users ?? 0, sub: `${proCount} Pro, ${freeCount} Free` },
    { label: 'MRR', value: `IDR ${fmt(revenue?.mrr ?? 0)}`, sub: 'Monthly recurring' },
    { label: 'Conversion', value: `${(users?.conversion_rate ?? 0).toFixed(1)}%`, sub: 'Free → Pro rate' },
    { label: 'Churn', value: `${(users?.churn_rate ?? 0).toFixed(1)}%`, sub: 'Cancelled / Pro' },
    { label: 'Signups', value: totalSignups, sub: `Last ${days} days` },
    { label: 'Tool Uses', value: totalUsage, sub: `Last ${days} days` },
  ]

  const maxSignups = Math.max(1, ...(users?.signups?.map((d) => d.count) ?? [1]))
  const maxUsage = Math.max(1, ...(tools?.daily_usage?.map((d) => d.total) ?? [1]))
  const maxToolUses = Math.max(1, ...(tools?.top_tools?.slice(0, 5).map((t) => t.total_uses) ?? [1]))

  return (
    <AdminLayout active="analytics">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Analytics</div>
            <h1>Dashboard</h1>
            <p>Comprehensive view of users, revenue, conversions, and tool usage — {days}-day window.</p>
          </div>
          <div className="admin-pill-group">
            {[7, 30, 60, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} className={days === d ? 'active' : ''}>{d}d</button>
            ))}
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading && <p>Loading analytics...</p>}

        {!loading && (
          <>
            <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
              {kpis.map((kpi) => (
                <div key={kpi.label} className="admin-card">
                  <div className="admin-card__label">{kpi.label}</div>
                  <div className="admin-card__value" style={{ fontSize: 20 }}>{kpi.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div className="admin-grid-2">
              <div className="admin-panel">
                <h2>Daily Signups · {days}d</h2>
                <div className="admin-line">
                  {users?.signups?.map((row) => (
                    <div key={row.date} title={`${row.date}: ${row.count}`} style={{ height: `${Math.max(8, (row.count / maxSignups) * 100)}%` }} />
                  ))}
                  {!users?.signups?.length && <p className="admin-empty">No data</p>}
                </div>
              </div>

              <div className="admin-panel">
                <h2>Daily Tool Usage · {days}d</h2>
                <div className="admin-line">
                  {tools?.daily_usage?.map((row) => (
                    <div key={row.date} title={`${row.date}: ${row.total}`} style={{ height: `${Math.max(8, (row.total / maxUsage) * 100)}%` }} />
                  ))}
                  {!tools?.daily_usage?.length && <p className="admin-empty">No data</p>}
                </div>
              </div>
            </div>

            <div className="admin-panel" style={{ marginTop: 18 }}>
              <h2>Top Tools · {days}d</h2>
              <div className="admin-bars">
                {tools?.top_tools?.slice(0, 5).map((t) => (
                  <div key={t.tool_id} className="admin-bar-row">
                    <span>{t.tool_id}</span>
                    <div><i style={{ width: `${Math.max(6, (t.total_uses / maxToolUses) * 100)}%` }} /></div>
                    <b>{t.total_uses.toLocaleString()} <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>({t.unique_users} users)</span></b>
                  </div>
                ))}
                {!tools?.top_tools?.length && <p className="admin-empty">No data</p>}
              </div>
            </div>

            <div className="admin-grid-2" style={{ marginTop: 18 }}>
              <div className="admin-panel">
                <h2>Plan Distribution</h2>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {users?.plan_breakdown?.map((p) => (
                    <div key={p.plan} style={{ flex: 1, textAlign: 'center', padding: 16, background: 'var(--bg-2)', borderRadius: 12 }}>
                      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{p.count}</div>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '.08em' }}>{p.plan}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel">
                <h2>Geo Distribution</h2>
                <div className="admin-bars">
                  {geo?.geo?.slice(0, 8).map((g) => (
                    <div key={g.country_code} className="admin-bar-row">
                      <span>{g.country_code}</span>
                      <div><i style={{ width: `${Math.max(6, (g.unique_users / Math.max(1, geo.geo[0]?.unique_users ?? 1)) * 100)}%` }} /></div>
                      <b>{g.unique_users} users</b>
                    </div>
                  ))}
                  {!geo?.geo?.length && <p className="admin-empty">No geo data yet. Captures from Cloudflare CF-IPCountry after user activity.</p>}
                </div>
              </div>

              <div className="admin-panel">
                <h2>Key Metrics</h2>
                <dl className="admin-detail-list">
                  <dt>Total Revenue</dt><dd>IDR {fmt(revenue?.total_revenue ?? 0)}</dd>
                  <dt>Avg Transaction</dt><dd>IDR {fmt(revenue?.avg_transaction ?? 0)}</dd>
                  <dt>Conversion Rate</dt><dd>{(users?.conversion_rate ?? 0).toFixed(2)}%</dd>
                  <dt>Churn Rate</dt><dd>{(users?.churn_rate ?? 0).toFixed(2)}%</dd>
                </dl>
              </div>
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  )
}
