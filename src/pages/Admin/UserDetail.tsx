import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import ManagePlanModal from './ManagePlanModal'
import { getAdminUser, patchAdminUser, type AdminTransaction, type User } from '../../lib/api'

export default function UserDetail() {
  const { id = '' } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [usage, setUsage] = useState<{ date: string; tool_id: string; count: number; limit_hits: number }[]>([])
  const [credits, setCredits] = useState<{ pack_type: string; remaining: number }[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)

  function load() {
    getAdminUser(id)
      .then((data) => {
        setUser(data.user)
        setTransactions(data.transactions)
        setUsage(data.usage_log)
        setCredits(data.credits ?? [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }

  useEffect(load, [id])

  function handleBan() {
    if (!user || !confirm(`Ban ${user.email}?`)) return
    patchAdminUser(id, { status: 'banned' })
      .then(({ user }) => { setUser(user); setSuccess(`Banned ${user.email}`) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }

  function handleModalSaved(message: string) {
    setSuccess(message)
    load()
  }

  return (
    <AdminLayout active="users">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <Link to="/admin/users" className="admin-back">← Users</Link>
            <h1>{user?.email ?? 'User detail'}</h1>
            <p>Plan, status, transaction history, and last 30 days usage by tool.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error} <button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success} <button onClick={() => setSuccess('')}>×</button></div>}
        {user && (
          <div className="admin-grid-2">
            <div className="admin-panel">
              <h2>Account</h2>
              <dl className="admin-detail-list">
                <dt>ID</dt><dd>{user.id}</dd>
                <dt>Email</dt><dd>{user.email}</dd>
                <dt>Plan</dt><dd><span className={`badge ${user.plan === 'pro' ? `badge--${user.pro_tier ?? 'pro'}` : 'badge--free'}`}>{user.plan === 'pro' ? `Pro · ${user.pro_tier ?? 'pro'}` : 'Free'}</span></dd>
                <dt>Role</dt><dd>{user.role}</dd>
                <dt>Status</dt><dd>{user.status}</dd>
                <dt>Credits</dt><dd>{credits.length ? credits.map((c) => `${c.remaining} ${c.pack_type}`).join(', ') : '—'}</dd>
                <dt>Pro expires</dt><dd>{user.pro_expires_at ? new Date(user.pro_expires_at * 1000).toLocaleString() : '—'}</dd>
                <dt>Last login</dt><dd>{user.last_login ? new Date(user.last_login * 1000).toLocaleString() : '—'}</dd>
                <dt>Created</dt><dd>{user.created_at ? new Date(user.created_at * 1000).toLocaleString() : '—'}</dd>
              </dl>
              <div className="admin-actions">
                <button className="admin-btn admin-btn--primary" onClick={() => setShowModal(true)}>Manage plan & credits</button>
                {user.status !== 'banned' && (
                  <button className="admin-btn admin-btn--danger" onClick={handleBan}>Ban</button>
                )}
              </div>
            </div>

            <div className="admin-panel">
              <h2>Usage · last 30 days</h2>
              <div className="admin-table-wrap compact">
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Tool</th><th>Uses</th><th>Limit hits</th></tr></thead>
                  <tbody>{usage.map((row) => <tr key={`${row.date}-${row.tool_id}`}><td>{row.date}</td><td>{row.tool_id}</td><td>{row.count}</td><td>{row.limit_hits}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="admin-panel" style={{ marginTop: 20 }}>
          <h2>Transactions</h2>
          <div className="admin-table-wrap compact">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Amount</th><th>Status</th><th>Order</th><th>Date</th></tr></thead>
              <tbody>{transactions.map((tx) => <tr key={tx.id}><td>{tx.id}</td><td>{tx.currency} {tx.amount}</td><td><span className={`status status--${tx.status}`}>{tx.status}</span></td><td>{tx.midtrans_order_id ?? '—'}</td><td>{new Date(tx.created_at * 1000).toLocaleString()}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      {showModal && user && (
        <ManagePlanModal
          user={user}
          onClose={() => setShowModal(false)}
          onSaved={handleModalSaved}
        />
      )}
    </AdminLayout>
  )
}
