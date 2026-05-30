import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminSubscriptionSummary, getAdminSubscriptions, patchAdminSubscription, type AdminSubscription, type SubscriptionSummary } from '../../lib/api'

export default function Subscriptions() {
  const [filter, setFilter] = useState('active')
  const [subs, setSubs] = useState<AdminSubscription[]>([])
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      getAdminSubscriptions({ page: 1, limit: 50, filter }),
      getAdminSubscriptionSummary(),
    ])
      .then(([list, sum]) => {
        setSubs(list.subscriptions)
        setSummary(sum)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

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
  ]

  return (
    <AdminLayout active="subscriptions">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Payments</div>
            <h1>Subscriptions</h1>
            <p>Manage active Pro subscribers, renewals, cancellations, grace periods, and manual extensions.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {message && <div className="admin-success">{message}<button onClick={() => setMessage('')}>×</button></div>}

        <div className="admin-stat-grid">
          {cards.map(([key, label, value]) => (
            <button key={key} className="admin-card" onClick={() => setFilter(String(key))} style={{ textAlign: 'left', cursor: 'pointer', outline: filter === key ? '2px solid var(--accent)' : 'none' }}>
              <div className="admin-card__label">{label}</div>
              <div className="admin-card__value">{value}</div>
            </button>
          ))}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Expiry</th><th>Status</th><th>Grace</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6}>Loading...</td></tr>}
              {!loading && !subs.length && <tr><td colSpan={6}>No subscriptions found.</td></tr>}
              {!loading && subs.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.pro_expires_at ? new Date(user.pro_expires_at * 1000).toLocaleDateString() : '—'}</td>
                  <td>{user.cancel_at_period_end ? <span className="status status--pending">cancelled</span> : <span className="status status--success">active</span>}</td>
                  <td>{user.grace_until ? new Date(user.grace_until * 1000).toLocaleDateString() : '—'}</td>
                  <td>{user.last_login ? new Date(user.last_login * 1000).toLocaleDateString() : '—'}</td>
                  <td>
                    <button onClick={() => action(user, 'extend')} title="Extend">⏰</button>
                    {user.cancel_at_period_end ? (
                      <button onClick={() => action(user, 'reactivate')} title="Reactivate">↩</button>
                    ) : (
                      <button onClick={() => action(user, 'cancel')} title="Cancel">⏸</button>
                    )}
                    <button onClick={() => action(user, 'downgrade')} title="Downgrade">⬇</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}
