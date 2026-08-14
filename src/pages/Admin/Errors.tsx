import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminErrors, type AdminError } from '../../lib/api'

export default function Errors() {
  const [errors, setErrors] = useState<AdminError[]>([])
  const [groups, setGroups] = useState<{ tool_id: string; error_type: string; count: number }[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminErrors()
      .then((data) => {
        setErrors(data.errors)
        setGroups(data.groups)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }, [])

  return (
    <AdminLayout active="errors">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Internal</div>
            <h1>Errors</h1>
            <p>Last 100 error log entries, grouped by tool and error type.</p>
          </div>
        </div>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-panel">
          <h2>Groups</h2>
          <div className="admin-table-wrap compact">
            <table className="admin-table">
              <thead><tr><th>Tool</th><th>Error type</th><th>Count</th></tr></thead>
              <tbody>
                {groups.map((g, i) => <tr key={i}><td>{g.tool_id}</td><td>{g.error_type}</td><td>{g.count}</td></tr>)}
                {!groups.length && <tr><td colSpan={3}>No errors logged.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-panel" style={{ marginTop: 20 }}>
          <h2>Recent entries</h2>
          <div className="admin-table-wrap compact">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Tool</th><th>Type</th><th>Plan</th><th>Date</th></tr></thead>
              <tbody>
                {errors.map((e) => <tr key={e.id}><td>{e.id}</td><td>{e.tool_id}</td><td>{e.error_type}</td><td>{e.plan ?? '—'}</td><td>{new Date(e.created_at * 1000).toLocaleString()}</td></tr>)}
                {!errors.length && <tr><td colSpan={5}>No error logs.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
