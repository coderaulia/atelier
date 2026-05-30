import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getAdminBugReports, type BugReport } from '../../lib/api'

export default function BugReports() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [reports, setReports] = useState<BugReport[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const page = Number(params.get('page') ?? 1)
  const status = params.get('status') ?? ''
  const severity = params.get('severity') ?? ''

  useEffect(() => {
    setLoading(true)
    getAdminBugReports({ page, limit: 20, status, severity })
      .then((data) => {
        setReports(data.bug_reports)
        setTotal(data.total)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bug reports'))
      .finally(() => setLoading(false))
  }, [page, status, severity])

  const statusCounts = {
    new: reports.filter((r) => r.status === 'new').length,
    in_progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  }

  return (
    <AdminLayout active="bug-reports">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Internal</div>
            <h1>Bug Reports</h1>
            <p>{total} total reports · triage, assign, and resolve user-reported issues.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-toolbar">
          <div className="admin-pill-group">
            <button onClick={() => setParams({ page: '1', severity })} className={status === '' ? 'active' : ''}>
              All ({total})
            </button>
            <button onClick={() => setParams({ page: '1', status: 'new', severity })} className={status === 'new' ? 'active' : ''}>
              New ({statusCounts.new})
            </button>
            <button onClick={() => setParams({ page: '1', status: 'in_progress', severity })} className={status === 'in_progress' ? 'active' : ''}>
              In Progress ({statusCounts.in_progress})
            </button>
            <button onClick={() => setParams({ page: '1', status: 'resolved', severity })} className={status === 'resolved' ? 'active' : ''}>
              Resolved ({statusCounts.resolved})
            </button>
          </div>

          <div className="admin-pill-group" style={{ marginLeft: 'auto' }}>
            <button onClick={() => setParams({ page: '1', status, severity: '' })} className={severity === '' ? 'active' : ''}>
              All Severity
            </button>
            <button onClick={() => setParams({ page: '1', status, severity: 'critical' })} className={severity === 'critical' ? 'active' : ''}>
              Critical
            </button>
            <button onClick={() => setParams({ page: '1', status, severity: 'high' })} className={severity === 'high' ? 'active' : ''}>
              High
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>User</th>
                <th>Tool</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7}>Loading...</td>
                </tr>
              )}
              {!loading && !reports.length && (
                <tr>
                  <td colSpan={7}>No bug reports found.</td>
                </tr>
              )}
              {!loading &&
                reports.map((report) => (
                  <tr key={report.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/bug-reports/${report.id}`)}>
                    <td>
                      <strong>{report.subject}</strong>
                    </td>
                    <td>{report.email}</td>
                    <td>{report.tool_id ?? '—'}</td>
                    <td>
                      <span className={`badge badge--${report.severity}`}>{report.severity}</span>
                    </td>
                    <td>
                      <span className={`status status--${report.status}`}>{report.status.replace('_', ' ')}</span>
                    </td>
                    <td>{report.priority}</td>
                    <td>{new Date(report.created_at * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setParams({ page: String(page - 1), status, severity })}>
            ← Prev
          </button>
          <span>
            Page {page} / {Math.ceil(total / 20) || 1}
          </span>
          <button disabled={page * 20 >= total} onClick={() => setParams({ page: String(page + 1), status, severity })}>
            Next →
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}
