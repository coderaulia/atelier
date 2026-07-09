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

export default function Overview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Each guarded independently so one failing endpoint doesn't blank the page.
    getAdminStats().then(setStats).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'))
    getAdminRevenueAnalytics(30).then(setRevenue).catch(() => {})
    getAdminUserAnalytics(30).then(setUserAnalytics).catch(() => {})
    getHealthStatus().then(setHealth).catch(() => {})
  }, [])

  const mostUsedTool = stats?.top_tools?.[0]?.tool_id ?? '—'
  const maxTool = Math.max(1, ...(stats?.daily_tool_usage.map((d) => d.count) ?? [1]))
  const maxSignup = Math.max(1, ...(stats?.daily_signups.map((d) => d.count) ?? [1]))
  const maxRevenue = Math.max(1, ...(revenue?.trend.map((d) => d.revenue) ?? [1]))

  const primary: [string, string | number][] = [
    ['Total users', stats?.total_users ?? 0],
    ['Pro users', stats?.pro_users ?? 0],
    ['Revenue MTD', fmtIDR(stats?.revenue_this_month ?? 0)],
    ['Most used tool', mostUsedTool],
  ]

  const secondary: [string, string][] = [
    ['MRR', fmtIDR(revenue?.mrr ?? 0)],
    ['Total revenue', fmtIDR(revenue?.total_revenue ?? 0)],
    ['Conversion', `${userAnalytics?.conversion_rate ?? 0}%`],
    ['Churn', `${userAnalytics?.churn_rate ?? 0}%`],
    ['Active 24h', String(health?.metrics.active_sessions_24h ?? 0)],
    ['Errors / hr', String(health?.metrics.errors_last_hour ?? 0)],
    ['Pending refunds', String(health?.metrics.pending_refunds ?? 0)],
    ['Signups today', String(stats?.users_today ?? 0)],
  ]

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

        <div className="admin-stat-grid">
          {primary.map(([label, value]) => (
            <div key={label} className="admin-card">
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value">{value}</div>
            </div>
          ))}
        </div>

        <div className="admin-stat-grid admin-stat-grid--wide">
          {secondary.map(([label, value]) => (
            <div key={label} className="admin-card admin-card--compact">
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value admin-card__value--sm">{value}</div>
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

        <div className="admin-grid-2" style={{ marginTop: 18 }}>
          <div className="admin-panel">
            <h2>Revenue · 30 days</h2>
            <div className="admin-line">
              {(revenue?.trend ?? []).map((row, index) => (
                <div key={`${row.date}-${index}`} title={`${row.date}: ${fmtIDR(row.revenue)}`} style={{ height: `${Math.max(8, (row.revenue / maxRevenue) * 100)}%` }} />
              ))}
              {!revenue?.trend.length && <p className="admin-empty">No revenue yet.</p>}
            </div>
          </div>

          <div className="admin-panel">
            <h2>Plan breakdown</h2>
            <div className="admin-bars">
              {(userAnalytics?.plan_breakdown ?? []).map((row) => {
                const total = userAnalytics?.plan_breakdown.reduce((s, r) => s + r.count, 0) ?? 1
                return (
                  <div key={row.plan} className="admin-bar-row">
                    <span>{row.plan}</span>
                    <div><i style={{ width: `${Math.max(6, (row.count / Math.max(1, total)) * 100)}%` }} /></div>
                    <b>{row.count}</b>
                  </div>
                )
              })}
              {!userAnalytics?.plan_breakdown.length && <p className="admin-empty">No data yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

function fmtIDR(amount: number): string {
  if (!amount) return 'IDR 0'
  return `IDR ${amount.toLocaleString('en-US')}`
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
