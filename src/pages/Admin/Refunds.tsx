import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getAdminRefunds, processAdminRefund, type AdminRefund } from '../../lib/api'

const USAGE_THRESHOLD = 5 // users with 5+ uses must be manually reviewed

export default function Refunds() {
  const [params, setParams] = useSearchParams()
  const [refunds, setRefunds] = useState<AdminRefund[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const page = Number(params.get('page') ?? 1)
  const status = params.get('status') ?? ''

  function load() {
    setLoading(true)
    getAdminRefunds({ page, limit: 20, status })
      .then((data) => { setRefunds(data.refunds); setTotal(data.total) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, status])

  async function handleProcess(refund: AdminRefund, action: 'approved' | 'rejected') {
    const notes = prompt(`Notes for ${action} refund (${refund.user_email})?`, '') ?? ''
    if (notes === null) return

    if (action === 'approved' && refund.usage_count >= USAGE_THRESHOLD) {
      if (!confirm(`⚠️ User has used tools ${refund.usage_count} times (≥${USAGE_THRESHOLD}). Are you sure you want to approve this refund?`)) return
    } else {
      if (!confirm(`${action} this refund request?`)) return
    }

    try {
      await processAdminRefund(refund.id, { status: action, notes })
      setSuccess(`Refund ${action} for ${refund.user_email}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const pendingCount = refunds.filter((r) => r.status === 'pending').length
  const highUsage = refunds.filter((r) => r.status === 'pending' && r.usage_count >= USAGE_THRESHOLD).length

  return (
    <AdminLayout active="refunds">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Payments</div>
            <h1>Refund Requests</h1>
            <p>All refunds require manual approval. Users with {USAGE_THRESHOLD}+ tool uses are flagged.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}

        {pendingCount > 0 && (
          <div style={{ padding: '12px 16px', background: 'rgba(234,179,8,.12)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 12, marginBottom: 16, fontSize: 13 }}>
            ⚠️ <strong>{pendingCount} pending refund(s)</strong> require review — {highUsage} with high usage ({USAGE_THRESHOLD}+ uses)
          </div>
        )}

        <div className="admin-toolbar">
          <div className="admin-pill-group">
            {(['', 'pending', 'approved', 'rejected', 'completed'] as const).map((s) => (
              <button key={s} onClick={() => setParams({ page: '1', status: s })} className={status === s ? 'active' : ''}>
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({total})
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Amount</th><th>Reason</th><th>Usage</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7}>Loading...</td></tr>}
              {!loading && !refunds.length && <tr><td colSpan={7}>No refund requests.</td></tr>}
              {!loading && refunds.map((r) => (
                <tr key={r.id} style={{ background: r.status === 'pending' && r.usage_count >= USAGE_THRESHOLD ? 'rgba(234,179,8,.05)' : '' }}>
                  <td>{r.user_email}</td>
                  <td>{r.currency} {(r.amount / 100).toLocaleString()}</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'normal', fontSize: 12 }}>{r.reason}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: r.usage_count >= USAGE_THRESHOLD ? '#a16207' : '#157347' }}>
                      {r.usage_count} uses
                    </span>
                    {r.usage_count >= USAGE_THRESHOLD && <span style={{ marginLeft: 4, fontSize: 11 }}>⚠️</span>}
                  </td>
                  <td><span className={`status status--${r.status}`}>{r.status}</span></td>
                  <td>{new Date(r.requested_at * 1000).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleProcess(r, 'approved')} title="Approve" style={{ color: '#157347', marginRight: 4 }}>✓</button>
                        <button onClick={() => handleProcess(r, 'rejected')} title="Reject" style={{ color: '#b52a2a' }}>✕</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setParams({ page: String(page - 1), status })}>← Prev</button>
          <span>Page {page} / {Math.ceil(total / 20) || 1}</span>
          <button disabled={page * 20 >= total} onClick={() => setParams({ page: String(page + 1), status })}>Next →</button>
        </div>
      </section>
    </AdminLayout>
  )
}
