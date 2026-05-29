import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReceipt, type Transaction } from '../lib/api'

export default function Receipt() {
  const { transaction_id = '' } = useParams()
  const navigate = useNavigate()
  const [tx, setTx] = useState<Transaction | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    getReceipt(Number(transaction_id))
      .then((data) => setTx(data.transaction))
      .catch((err) => setError(err instanceof Error ? err.message : 'Receipt not found'))
  }, [transaction_id, navigate])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 40 }}>
      <div className="account-panel" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="eyebrow eyebrow--accent">Receipt</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 42, margin: '8px 0 20px' }}>Vanaila Studio receipt</h1>
        {error && <div className="account-message">{error}</div>}
        {tx && (
          <>
            <dl className="account-detail-list">
              <dt>Receipt</dt><dd>#{tx.id}</dd>
              <dt>Email</dt><dd>{tx.email ?? '—'}</dd>
              <dt>Date</dt><dd>{new Date(tx.created_at * 1000).toLocaleString()}</dd>
              <dt>Plan</dt><dd>{tx.plan_type}</dd>
              <dt>Amount</dt><dd>{tx.currency} {tx.amount}</dd>
              <dt>Status</dt><dd><span className={`status status--${tx.status}`}>{tx.status}</span></dd>
              <dt>Order ID</dt><dd>{tx.midtrans_order_id ?? '—'}</dd>
            </dl>
            <button onClick={() => window.print()} className="btn btn--accent">Print receipt</button>
          </>
        )}
      </div>
    </div>
  )
}
