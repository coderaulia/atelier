import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import DataTable, { type DataTableColumn } from '../../components/admin/DataTable'
import RowActions, { RowActionButton } from '../../components/admin/RowActions'
import { getAdminSubscriptionSummary, getAdminSubscriptions, patchAdminSubscription, type AdminSubscription, type SubscriptionSummary } from '../../lib/api'

function creditsLabel(sub: AdminSubscription): string {
  const parts: string[] = []
  if (sub.cv_credits) parts.push(`${sub.cv_credits} CV`)
  if (sub.social_credits) parts.push(`${sub.social_credits} Social`)
  return parts.length ? parts.join(', ') : '—'
}

export default function Subscriptions() {
  const [filter, setFilter] = useState('active')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [subs, setSubs] = useState<AdminSubscription[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      getAdminSubscriptions({ page: 1, limit: 50, filter, search }),
      getAdminSubscriptionSummary(),
    ])
      .then(([list, sum]) => {
        setSubs(list.subscriptions)
        setTotal(list.total)
        setSummary(sum)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter, search])

  async function action(user: AdminSubscription, type: 'extend' | 'cancel' | 'downgrade' | 'reactivate') {
    const reason = prompt(`Reason for ${type} ${user.email}?`) ?? ''
    if (reason === null) return
    const days = type === 'extend' ? Number(prompt('Extend by how many days?', '30')) : undefined
    if (type === 'extend' && (!days || days <= 0)) return
    if (!confirm(`${type} subscription for ${user.email}?`)) return

    try {
      await patchAdminSubscription(user.id, { action: type, days, reason })
      setMessage(`Subscription ${type} complete for ${user.email}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const cards = [
    ['active', 'Active', summary?.active ?? 0],
    ['expiring', 'Expiring 30d', summary?.expiring_soon ?? 0],
    ['cancelled', 'Cancelled', summary?.cancelled ?? 0],
    ['grace', 'Grace', summary?.in_grace ?? 0],
  ] as const

  const columns: DataTableColumn<AdminSubscription>[] = [
    { key: 'email', header: 'User', render: (user) => user.email },
    {
      key: 'pro_tier',
      header: 'Tier',
      render: (user) => <span className={`badge badge--${user.pro_tier ?? 'pro'}`}>{user.pro_tier ?? 'pro'}</span>,
    },
    { key: 'credits', header: 'Credits', render: creditsLabel },
    {
      key: 'pro_expires_at',
      header: 'Expiry',
      render: (user) => (user.pro_expires_at ? new Date(user.pro_expires_at * 1000).toLocaleDateString() : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) =>
        user.cancel_at_period_end ? (
          <span className="status status--pending">cancelled</span>
        ) : (
          <span className="status status--success">active</span>
        ),
    },
    {
      key: 'grace_until',
      header: 'Grace',
      render: (user) => (user.grace_until ? new Date(user.grace_until * 1000).toLocaleDateString() : '—'),
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (user) => (user.last_login ? new Date(user.last_login * 1000).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <RowActions>
          <RowActionButton onClick={() => action(user, 'extend')} title="Extend subscription">⏰</RowActionButton>
          {user.cancel_at_period_end ? (
            <RowActionButton onClick={() => action(user, 'reactivate')} title="Reactivate" variant="success">↩</RowActionButton>
          ) : (
            <RowActionButton onClick={() => action(user, 'cancel')} title="Cancel">⏸</RowActionButton>
          )}
          <RowActionButton onClick={() => action(user, 'downgrade')} title="Downgrade to Free" variant="danger">⬇</RowActionButton>
        </RowActions>
      ),
    },
  ]

  return (
    <AdminLayout active="subscriptions">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Payments</div>
            <h1>Subscriptions</h1>
            <p>{total} matching · manage active Pro subscribers, renewals, cancellations, grace periods, and manual extensions.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {message && <div className="admin-success">{message}<button onClick={() => setMessage('')}>×</button></div>}

        <div className="admin-stat-grid">
          {cards.map(([key, label, value]) => (
            <button key={key} className="admin-card" onClick={() => setFilter(key)} style={{ textAlign: 'left', cursor: 'pointer', outline: filter === key ? '2px solid var(--accent)' : 'none' }}>
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value">{value}</div>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={subs}
          loading={loading}
          rowKey={(user) => user.id}
          emptyMessage="No subscriptions found."
          search={{
            value: searchInput,
            onChange: setSearchInput,
            onSubmit: () => setSearch(searchInput),
            placeholder: 'Search by email',
          }}
        />
      </section>
    </AdminLayout>
  )
}
