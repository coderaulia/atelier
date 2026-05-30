import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getHealthStatus, type HealthStatus } from '../../lib/api'

export default function HealthMonitor() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  function load() {
    getHealthStatus()
      .then(setHealth)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    if (!autoRefresh) return
    const interval = setInterval(load, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [autoRefresh])

  const statusColor = health?.status === 'healthy' ? '#157347' : health?.status === 'degraded' ? '#a16207' : '#b52a2a'
  const statusIcon = health?.status === 'healthy' ? '✓' : health?.status === 'degraded' ? '⚠' : '✕'

  return (
    <AdminLayout active="health">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">System</div>
            <h1>Health Monitor</h1>
            <p>Real-time system health, database status, and operational metrics.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh (30s)
            </label>
            <button onClick={load} className="btn">Refresh</button>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading && <p>Loading...</p>}

        {!loading && health && (
          <>
            <div className="admin-panel" style={{ marginBottom: 20, background: `linear-gradient(145deg, ${statusColor}08, ${statusColor}04)`, border: `1px solid ${statusColor}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 48, color: statusColor }}>{statusIcon}</div>
                <div>
                  <h2 style={{ margin: '0 0 4px', textTransform: 'capitalize', color: statusColor }}>{health.status}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>
                    Last checked: {new Date(health.timestamp * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-grid-2">
              <div className="admin-panel">
                <h2>System Checks</h2>
                <dl className="admin-detail-list">
                  <dt>Database</dt>
                  <dd>
                    <span className={`status status--${health.checks.database === 'healthy' ? 'success' : 'failed'}`}>
                      {health.checks.database}
                    </span>
                  </dd>
                  <dt>API</dt>
                  <dd>
                    <span className={`status status--${health.checks.api === 'healthy' ? 'success' : 'failed'}`}>
                      {health.checks.api}
                    </span>
                  </dd>
                </dl>
              </div>

              <div className="admin-panel">
                <h2>Operational Metrics</h2>
                <dl className="admin-detail-list">
                  <dt>Errors (1h)</dt>
                  <dd style={{ fontWeight: 700, color: health.metrics.errors_last_hour > 10 ? '#b52a2a' : 'var(--ink)' }}>
                    {health.metrics.errors_last_hour}
                  </dd>
                  <dt>Active Sessions (24h)</dt>
                  <dd>{health.metrics.active_sessions_24h}</dd>
                  <dt>Pending Refunds</dt>
                  <dd style={{ fontWeight: health.metrics.pending_refunds > 0 ? 700 : 400, color: health.metrics.pending_refunds > 0 ? '#a16207' : 'var(--ink)' }}>
                    {health.metrics.pending_refunds}
                  </dd>
                  <dt>Unread Notifications</dt>
                  <dd style={{ fontWeight: health.metrics.unread_notifications > 0 ? 700 : 400 }}>
                    {health.metrics.unread_notifications}
                  </dd>
                </dl>
              </div>
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  )
}
