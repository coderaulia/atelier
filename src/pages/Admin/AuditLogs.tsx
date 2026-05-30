import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminAuditLogs, getAdminAuditActions, type AuditLogEntry } from '../../lib/api'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [actions, setActions] = useState<{ action: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const limit = 25

  function load() {
    setLoading(true)
    getAdminAuditLogs({ page, limit, action: action || undefined })
      .then((data) => { setLogs(data.logs); setTotal(data.total) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, action])

  useEffect(() => {
    getAdminAuditActions()
      .then((data) => setActions(data.actions))
      .catch(() => {})
  }, [])

  const totalPages = Math.ceil(total / limit)

  function parseChanges(json: string | null | undefined) {
    if (!json) return null
    try {
      const obj = JSON.parse(json)
      return Object.entries(obj).map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(', ')
    } catch {
      return json
    }
  }

  return (
    <AdminLayout active="audit-logs">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Audit</div>
            <h1>Audit Logs</h1>
            <p>Track all admin actions with before/after diffs, IP addresses, and timestamps.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }}>
            <option value="">All actions</option>
            {actions.map((a) => <option key={a.action} value={a.action}>{a.action} ({a.count})</option>)}
          </select>
          <span style={{ fontSize: 13, color: 'var(--ink-3)', alignSelf: 'center' }}>{total} total logs</span>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && !logs.length && <p style={{ color: 'var(--ink-3)' }}>No audit logs found.</p>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th><th>Changes</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(log.created_at * 1000).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{log.admin_email ?? log.admin_id.slice(0, 8)}</td>
                    <td><span className={`status status--${log.action.includes('delete') ? 'failed' : log.action.includes('update') ? 'in_progress' : 'new'}`}>{log.action}</span></td>
                    <td style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>{log.target_email ?? log.target_user_id?.slice(0, 8) ?? '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--ink-2)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={parseChanges(log.changes) ?? ''}>
                      {parseChanges(log.changes) ?? '—'}
                    </td>
                    <td style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>{log.ip_address ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ fontSize: 13, alignSelf: 'center', color: 'var(--ink-3)' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </section>
    </AdminLayout>
  )
}
