import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import DataTable, { type DataTableColumn } from '../../components/admin/DataTable'
import { getAdminTransactions, type AdminTransaction } from '../../lib/api'

export default function Transactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'created_at' | 'amount'>('created_at')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getAdminTransactions({ page, limit: 20, sort, direction, search })
      .then((data) => {
        setTransactions(data.transactions as AdminTransaction[])
        setTotal(data.total)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [page, sort, direction, search])

  function handleSort(key: string) {
    if (key !== 'created_at' && key !== 'amount') return
    if (sort === key) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(key)
      setDirection('desc')
    }
  }

  const columns: DataTableColumn<AdminTransaction>[] = [
    { key: 'id', header: 'ID', render: (tx) => tx.id },
    { key: 'user_email', header: 'User', render: (tx) => tx.user_email },
    { key: 'amount', header: 'Amount', sortable: true, render: (tx) => `${tx.currency} ${tx.amount}` },
    { key: 'plan_type', header: 'Plan', render: (tx) => tx.plan_type },
    { key: 'status', header: 'Status', render: (tx) => <span className={`status status--${tx.status}`}>{tx.status}</span> },
    { key: 'midtrans_order_id', header: 'Order ID', render: (tx) => tx.midtrans_order_id ?? '—' },
    { key: 'created_at', header: 'Date', sortable: true, render: (tx) => new Date(tx.created_at * 1000).toLocaleString() },
  ]

  return (
    <AdminLayout active="transactions">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Internal</div>
            <h1>Transactions</h1>
            <p>{total} total · payment records, status, amount, order id, and recency.</p>
          </div>
        </div>
        {error && <div className="admin-error">{error}</div>}

        <DataTable
          columns={columns}
          rows={transactions}
          loading={loading}
          rowKey={(tx) => tx.id}
          emptyMessage="No transactions yet."
          search={{
            value: searchInput,
            onChange: setSearchInput,
            onSubmit: () => { setPage(1); setSearch(searchInput) },
            placeholder: 'Search by email or order ID',
          }}
          sort={{ key: sort, direction, onChange: handleSort }}
          pagination={{ page, total, limit: 20, onPageChange: setPage }}
        />
      </section>
    </AdminLayout>
  )
}
