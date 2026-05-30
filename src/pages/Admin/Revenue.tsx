import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminRevenueAnalytics, getAdminUserAnalytics, getAdminToolAnalytics, type RevenueAnalytics, type UserAnalytics, type ToolAnalytics } from '../../lib/api'

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

  const maxRevenue = Math.max(1, ...(revenue?.trend?.map((d) => d.revenue) ?? [1]))
  const maxSignups = Math.max(1, ...(users?.signups?.map((d) => d.count) ?? [1]))
  const maxUsage = Math.max(1, ...(tools?.top_tools?.map((t) => t.total_uses) ?? [1]))

  const proCount = users?.plan_breakdown?.find((p) => p.plan === 'pro')?.count ?? 0

  const kpis = [
    ['MRR', `IDR ${fmt(revenue?.mrr ?? 0)}`, 'Monthly recurring revenue'],
    ['Total Revenue', `IDR ${fmt(revenue?.total_revenue ?? 0)}`, 'All-time successful payments'],
    ['Avg Transaction', `IDR ${fmt(revenue?.avg_transaction ?? 0)}`, 'Per payment average'],
    ['Pro Users', String(proCount), 'Current subscribers'],
    ['Conversion', `${revenue ? (users?.conversion_rate ?? 0).toFixed(1) : 0}%`, 'Free → Pro rate'],
    ['Churn Rate', `${revenue ? (users?.churn_rate ?? 0).toFixed(1) : 0}%`, 'Cancelled / total Pro'],
  ]

  return (
    <AdminLayout active="revenue">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Analytics</div>
            <h1>Revenue</h1>
            <p>MRR, revenue trends, user conversion, churn rate, and top tools — {days}-day window.</p>
          </div>
          <div className="admin-pill-group">
            {[7, 30, 60, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} className={days === d ? 'active' : ''}>{d}d</button>
            ))}
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
          {kpis.map(([label, value, sub]) => (
            <div key={label} className="admin-card">
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value" style={{ fontSize: 20 }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {!loading && (
          <div className="admin-grid-2">
            <div className="admin-panel">
              <h2>Revenue trend · {days} days</h2>
              <div className="admin-bars">
                {revenue?.trend?.slice(-14).map((row) => (
                  <div key={row.date} className="admin-bar-row">
                    <span>{row.date.slice(5)}</span>
                    <div><i style={{ width: `${Math.max(6, (row.revenue / maxRevenue) * 100)}%` }} /></div>
                    <b style={{ fontSize: 11 }}>IDR {fmt(row.revenue)}</b>
                  </div>
                ))}
                {!revenue?.trend?.length && <p className="admin-empty">No revenue data yet.</p>}
              </div>
            </div>

            <div className="admin-panel">
              <h2>Daily signups · {days} days</h2>
              <div className="admin-line">
                {users?.signups?.map((row) => (
                  <div key={row.date} title={`${row.date}: ${row.count}`} style={{ height: `${Math.max(8, (row.count / maxSignups) * 100)}%` }} />
                ))}
                {!users?.signups?.length && <p className="admin-empty">No signups yet.</p>}
              </div>
            </div>
          </div>
        )}

        {!loading && tools?.top_tools?.length ? (
          <div className="admin-panel" style={{ marginTop: 18 }}>
            <h2>Top tools · {days} days</h2>
            <div className="admin-bars">
              {tools.top_tools.map((t) => (
                <div key={t.tool_id} className="admin-bar-row">
                  <span>{t.tool_id}</span>
                  <div><i style={{ width: `${Math.max(6, (t.total_uses / maxUsage) * 100)}%` }} /></div>
                  <b>{t.total_uses} <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>({t.unique_users} u)</span></b>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </AdminLayout>
  )
}
