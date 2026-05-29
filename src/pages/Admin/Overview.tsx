import { useEffect, useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminStats, type AdminStats } from '../../lib/api'

export default function Overview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminStats().then(setStats).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'))
  }, [])

  const mostUsedTool = stats?.top_tools?.[0]?.tool_id ?? '—'
  const maxTool = Math.max(1, ...(stats?.daily_tool_usage.map((d) => d.count) ?? [1]))
  const maxSignup = Math.max(1, ...(stats?.daily_signups.map((d) => d.count) ?? [1]))

  const totals = useMemo(() => [
    ['Total users', stats?.total_users ?? 0],
    ['Pro users', stats?.pro_users ?? 0],
    ['Revenue MTD', `${stats?.revenue_this_month ?? 0}`],
    ['Most used tool', mostUsedTool],
  ], [stats, mostUsedTool])

  return (
    <AdminLayout active="overview">
      <section className="admin-page">
        <Header title="Overview" subtitle="Usage, revenue, signups, and limit pressure." />
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-stat-grid">
          {totals.map(([label, value]) => (
            <div key={label} className="admin-card">
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value">{value}</div>
            </div>
          ))}
        </div>

        <div className="admin-grid-2">
          <div className="admin-panel">
            <h2>Tool completions · 7 days</h2>
            <div className="admin-bars">
              {(stats?.daily_tool_usage ?? []).map((row, index) => (
                <div key={`${row.date}-${row.tool_id}-${index}`} className="admin-bar-row">
                  <span>{row.date.slice(5)} · {row.tool_id}</span>
                  <div><i style={{ width: `${Math.max(6, (row.count / maxTool) * 100)}%` }} /></div>
                  <b>{row.count}</b>
                </div>
              ))}
              {!stats?.daily_tool_usage.length && <p className="admin-empty">No usage yet.</p>}
            </div>
          </div>

          <div className="admin-panel">
            <h2>New signups · 30 days</h2>
            <div className="admin-line">
              {(stats?.daily_signups ?? []).map((row, index) => (
                <div key={`${row.date}-${index}`} title={`${row.date}: ${row.count}`} style={{ height: `${Math.max(8, (row.count / maxSignup) * 100)}%` }} />
              ))}
              {!stats?.daily_signups.length && <p className="admin-empty">No signups yet.</p>}
            </div>
          </div>
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
