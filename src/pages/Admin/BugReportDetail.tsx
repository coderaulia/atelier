import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import {
  addBugReportComment,
  getAdminBugReport,
  patchAdminBugReport,
  type BugReport,
  type BugReportComment,
} from '../../lib/api'

export default function BugReportDetail() {
  const { id = '' } = useParams()
  const [report, setReport] = useState<BugReport | null>(null)
  const [comments, setComments] = useState<BugReportComment[]>([])
  const [comment, setComment] = useState('')
  const [internal, setInternal] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    getAdminBugReport(id)
      .then((data) => {
        setReport(data.bug_report)
        setComments(data.comments)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  async function update(body: Omit<Parameters<typeof patchAdminBugReport>[1], 'version'>) {
    setError('')
    setSuccess('')
    try {
      if (!report) return
      const data = await patchAdminBugReport(id, { ...body, version: report.version })
      setReport(data.bug_report)
      setSuccess('Bug report updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    setError('')
    try {
      await addBugReportComment(id, comment, internal)
      setComment('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    }
  }

  return (
    <AdminLayout active="bug-reports">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <Link to="/admin/bug-reports" className="admin-back">← Bug Reports</Link>
            <h1>{report?.subject ?? 'Bug report'}</h1>
            <p>Review details, update status, and add investigation notes.</p>
          </div>
        </div>

        {loading && <div className="admin-panel">Loading...</div>}
        {error && <div className="admin-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {report && (
          <>
            <div className="admin-grid-2">
              <div className="admin-panel">
                <h2>Report Details</h2>
                <dl className="admin-detail-list">
                  <dt>ID</dt><dd>{report.id}</dd>
                  <dt>User</dt><dd>{report.email}</dd>
                  <dt>Tool</dt><dd>{report.tool_id ?? '—'}</dd>
                  <dt>Source</dt><dd>{report.source}</dd>
                  <dt>Created</dt><dd>{new Date(report.created_at * 1000).toLocaleString()}</dd>
                  <dt>Updated</dt><dd>{new Date(report.updated_at * 1000).toLocaleString()}</dd>
                  <dt>User Agent</dt><dd style={{ wordBreak: 'break-word' }}>{report.user_agent ?? '—'}</dd>
                </dl>

                <div style={{ marginTop: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>Description</h3>
                  <div style={{ whiteSpace: 'pre-wrap', padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    {report.description}
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <h2>Triage</h2>

                <div className="admin-form-row">
                  <label>Status</label>
                  <select value={report.status} onChange={(e) => update({ status: e.target.value as BugReport['status'] })}>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="wont_fix">Won't Fix</option>
                  </select>
                </div>

                <div className="admin-form-row">
                  <label>Severity</label>
                  <select value={report.severity} onChange={(e) => update({ severity: e.target.value as BugReport['severity'] })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="admin-form-row">
                  <label>Priority (0-10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={report.priority}
                    onChange={(e) => update({ priority: Number(e.target.value) })}
                  />
                </div>

                <div className="admin-form-row">
                  <label>Resolution Notes</label>
                  <textarea
                    defaultValue={report.resolution_notes ?? ''}
                    rows={5}
                    onBlur={(e) => update({ resolution_notes: e.target.value })}
                    placeholder="What fixed this issue?"
                  />
                </div>
              </div>
            </div>

            <div className="admin-panel" style={{ marginTop: 20 }}>
              <h2>Comments</h2>

              <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8, background: c.is_internal ? 'rgba(227,88,44,0.06)' : 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--ink-3)' }}>
                      <span>{c.user_email ?? c.user_id} {c.is_internal ? '· Internal' : '· Public'}</span>
                      <span>{new Date(c.created_at * 1000).toLocaleString()}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{c.comment}</div>
                  </div>
                ))}
                {!comments.length && <p className="admin-empty">No comments yet.</p>}
              </div>

              <form onSubmit={submitComment}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add investigation note or user-facing reply..."
                  rows={4}
                  style={{ width: '100%', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                    Internal note
                  </label>
                  <button type="submit">Add Comment</button>
                </div>
              </form>
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  )
}
