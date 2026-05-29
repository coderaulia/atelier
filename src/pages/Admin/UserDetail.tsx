import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getAdminUser, patchAdminUser, type AdminTransaction, type User } from '../../lib/api'

export default function UserDetail() {
  const { id = '' } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [usage, setUsage] = useState<{ date: string; tool_id: string; count: number; limit_hits: number }[]>([])
  const [error, setError] = useState('')

  function load() {
    getAdminUser(id)
      .then((data) => {
        setUser(data.user)
        setTransactions(data.transactions)
        setUsage(data.usage_log)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }

  useEffect(load, [id])

  function update(body: Partial<Pick<User, 'plan' | 'status' | 'pro_expires_at'>>) {
    patchAdminUser(id, body).then(({ user }) => setUser(user)).catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
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

        {error && <div className="admin-error">{error}</div>}
        {user && (
          <div className="admin-grid-2">
            <div className="admin-panel">
              <h2>Account</h2>
              <dl className="admin-detail-list">
                <dt>ID</dt><dd>{user.id}</dd>
                <dt>Email</dt><dd>{user.email}</dd>
                <dt>Plan</dt><dd><span className={`badge badge--${user.plan}`}>{user.plan}</span></dd>
                <dt>Role</dt><dd>{user.role}</dd>
                <dt>Status</dt><dd>{user.status}</dd>
                <dt>Pro expires</dt><dd>{user.pro_expires_at ? new Date(user.pro_expires_at * 1000).toLocaleString() : '—'}</dd>
                <dt>Last login</dt><dd>{user.last_login ? new Date(user.last_login * 1000).toLocaleString() : '—'}</dd>
                <dt>Created</dt><dd>{user.created_at ? new Date(user.created_at * 1000).toLocaleString() : '—'}</dd>
              </dl>
              <div className="admin-actions">
                <button onClick={() => update({ plan: user.plan === 'pro' ? 'free' : 'pro' })}>Toggle plan</button>
                <button onClick={() => update({ plan: 'pro', pro_expires_at: Math.floor(Date.now() / 1000) + 30 * 86400 })}>Extend Pro 30d</button>
                <button onClick={() => update({ status: 'banned' })}>Ban</button>
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
    </AdminLayout>
  )
}
