import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminTransactions, type AdminTransaction } from '../../lib/api'

export default function Transactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [sort, setSort] = useState<'created_at' | 'amount'>('created_at')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminTransactions({ page: 1, limit: 50, sort, direction })
      .then((data) => setTransactions(data.transactions))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }, [sort, direction])

  return (
    <AdminLayout active="transactions">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Internal</div>
            <h1>Transactions</h1>
            <p>Payment records, status, amount, order id, and recency.</p>
          </div>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-toolbar">
          <button onClick={() => setSort('created_at')}>Sort by date</button>
          <button onClick={() => setSort('amount')}>Sort by amount</button>
          <button onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}>{direction}</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>User</th><th>Amount</th><th>Plan</th><th>Status</th><th>Order ID</th><th>Date</th></tr></thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.id}</td>
                  <td>{tx.user_email}</td>
                  <td>{tx.currency} {tx.amount}</td>
                  <td>{tx.plan_type}</td>
                  <td><span className={`status status--${tx.status}`}>{tx.status}</span></td>
                  <td>{tx.midtrans_order_id ?? '—'}</td>
                  <td>{new Date(tx.created_at * 1000).toLocaleString()}</td>
                </tr>
              ))}
              {!transactions.length && <tr><td colSpan={7}>No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}
