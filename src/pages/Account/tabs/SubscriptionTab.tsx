import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cancelSubscription, reactivateSubscription, getTransactions, type User, type Transaction } from '../../../lib/api';

function tierLabel(tier?: string | null): string {
  switch (tier) {
    case 'starter': return 'Starter'
    case 'business': return 'Business'
    default: return 'Pro'
  }
}

export function SubscriptionTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getTransactions().then((data) => {
      setTransactions(data.transactions)
      setHasMore(data.transactions.length === data.limit)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function loadMoreTransactions() {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const data = await getTransactions(nextPage)
      setTransactions((current) => [...current, ...data.transactions])
      setPage(nextPage)
      setHasMore(data.transactions.length === data.limit)
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleCancel() {
    if (!confirm(`You'll keep Pro access until ${user.pro_expires_at ? new Date(user.pro_expires_at * 1000).toLocaleDateString() : 'expiration'}. After that you'll move to the free plan.`)) return
    try {
      await cancelSubscription()
      setMessage('Subscription cancelled')
      onUpdate({ ...user, cancel_at_period_end: true })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleReactivate() {
    try {
      await reactivateSubscription()
      setMessage('Subscription reactivated')
      onUpdate({ ...user, cancel_at_period_end: false })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="account-panel">
      <h2>Subscription</h2>
      {user.plan === 'free' && (
        <div className="upgrade-card">
          <h3>Upgrade to Pro</h3>
          <p>Higher daily limits, premium templates, and bulk export.</p>
          <Link to="/pricing" className="btn btn--accent">See Pro plans</Link>
        </div>
      )}
      {user.plan === 'pro' && (
        <>
          <dl className="account-detail-list">
            <dt>Plan</dt><dd>{tierLabel(user.pro_tier)}</dd>
            <dt>Renewal</dt><dd>{user.pro_expires_at ? new Date(user.pro_expires_at * 1000).toLocaleDateString() : '—'}</dd>
            <dt>Status</dt><dd>{user.cancel_at_period_end ? 'Cancelled (active until expiration)' : 'Active'}</dd>
          </dl>
          {message && <div className="account-message">{message}</div>}
          {user.cancel_at_period_end ? (
            <button onClick={handleReactivate} className="btn">Reactivate subscription</button>
          ) : (
            <button onClick={handleCancel} className="btn">Cancel subscription</button>
          )}
        </>
      )}
      <h3 style={{ marginTop: 32 }}>Transaction history</h3>
      {loading && <p>Loading…</p>}
      {!loading && !transactions.length && <p style={{ color: 'var(--ink-3)' }}>No transactions yet.</p>}
      {!loading && transactions.length > 0 && (
        <table className="account-table">
          <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.created_at * 1000).toLocaleDateString()}</td>
                <td>{tx.currency} {tx.amount}</td>
                <td><span className={`status status--${tx.status}`}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && hasMore && (
        <button className="btn" onClick={loadMoreTransactions} disabled={loadingMore} style={{ marginTop: 16 }}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}

