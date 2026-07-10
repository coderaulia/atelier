import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import DataTable, { type DataTableColumn } from '../../components/admin/DataTable'
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

  const columns: DataTableColumn<BugReport>[] = [
    { key: 'subject', header: 'Subject', render: (r) => <strong>{r.subject}</strong> },
    { key: 'email', header: 'User', render: (r) => r.email },
    { key: 'tool_id', header: 'Tool', render: (r) => r.tool_id ?? '—' },
    { key: 'severity', header: 'Severity', render: (r) => <span className={`badge badge--${r.severity}`}>{r.severity}</span> },
    { key: 'status', header: 'Status', render: (r) => <span className={`status status--${r.status}`}>{r.status.replace('_', ' ')}</span> },
    { key: 'priority', header: 'Priority', render: (r) => r.priority },
    { key: 'created_at', header: 'Created', render: (r) => new Date(r.created_at * 1000).toLocaleDateString() },
  ]

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

        <DataTable
          columns={columns}
          rows={reports}
          loading={loading}
          rowKey={(r) => r.id}
          emptyMessage="No bug reports found."
          onRowClick={(r) => navigate(`/admin/bug-reports/${r.id}`)}
          pagination={{ page, total, limit: 20, onPageChange: (p) => setParams({ page: String(p), status, severity }) }}
        />
      </section>
    </AdminLayout>
  )
}
