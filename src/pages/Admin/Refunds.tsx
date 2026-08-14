import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import DataTable, { type DataTableColumn } from '../../components/admin/DataTable'
import RowActions, { RowActionButton } from '../../components/admin/RowActions'
import { getAdminRefunds, processAdminRefund, type AdminRefund } from '../../lib/api'

const USAGE_THRESHOLD = 5 // users with 5+ uses must be manually reviewed

export default function Refunds() {
  const [params, setParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '')
  const [refunds, setRefunds] = useState<AdminRefund[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const page = Number(params.get('page') ?? 1)
  const status = params.get('status') ?? ''
  const search = params.get('search') ?? ''

  function load() {
    setLoading(true)
    getAdminRefunds({ page, limit: 20, status, search })
      .then((data) => { setRefunds(data.refunds); setTotal(data.total) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, status, search])

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

  const columns: DataTableColumn<AdminRefund>[] = [
    { key: 'user_email', header: 'User', render: (r) => r.user_email },
    { key: 'amount', header: 'Amount', render: (r) => `${r.currency} ${(r.amount / 100).toLocaleString()}` },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <span style={{ maxWidth: 200, display: 'inline-block', whiteSpace: 'normal', fontSize: 12 }}>{r.reason}</span>,
    },
    {
      key: 'usage_count',
      header: 'Usage',
      render: (r) => (
        <>
          <span style={{ fontWeight: 700, color: r.usage_count >= USAGE_THRESHOLD ? '#a16207' : '#157347' }}>
            {r.usage_count} uses
          </span>
          {r.usage_count >= USAGE_THRESHOLD && <span style={{ marginLeft: 4, fontSize: 11 }}>⚠️</span>}
        </>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <span className={`status status--${r.status}`}>{r.status}</span> },
    { key: 'requested_at', header: 'Date', render: (r) => new Date(r.requested_at * 1000).toLocaleDateString() },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <RowActions>
            <RowActionButton onClick={() => handleProcess(r, 'approved')} title="Approve refund" variant="success">✓</RowActionButton>
            <RowActionButton onClick={() => handleProcess(r, 'rejected')} title="Reject refund" variant="danger">✕</RowActionButton>
          </RowActions>
        ) : null,
    },
  ]

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

        <DataTable
          columns={columns}
          rows={refunds}
          loading={loading}
          rowKey={(r) => r.id}
          emptyMessage="No refund requests."
          rowClassName={(r) => (r.status === 'pending' && r.usage_count >= USAGE_THRESHOLD ? 'high-usage' : undefined)}
          search={{
            value: searchInput,
            onChange: setSearchInput,
            onSubmit: () => setParams({ page: '1', status, search: searchInput }),
            placeholder: 'Search by email',
          }}
          filters={{
            value: status,
            options: [
              { value: '', label: `All (${total})` },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'completed', label: 'Completed' },
            ],
            onChange: (value) => setParams({ page: '1', status: value, search }),
          }}
          pagination={{ page, total, limit: 20, onPageChange: (p) => setParams({ page: String(p), status, search }) }}
        />
      </section>
    </AdminLayout>
  )
}
