import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import ManagePlanModal from './ManagePlanModal'
import DataTable, { type DataTableColumn } from '../../components/admin/DataTable'
import RowActions, { RowActionButton } from '../../components/admin/RowActions'
import { getAdminUsers, patchAdminUser, type User } from '../../lib/api'

function planBadge(user: User): { label: string; className: string } {
  if (user.plan !== 'pro') return { label: 'Free', className: 'badge--free' }
  const tier = user.pro_tier ?? 'pro'
  return { label: `Pro · ${tier}`, className: `badge--${tier}` }
}

type SortKey = 'created_at' | 'total_tool_uses'

export default function Users() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '')
  const [manageUser, setManageUser] = useState<User | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const page = Number(params.get('page') ?? 1)
  const search = params.get('search') ?? ''
  const plan = params.get('plan') ?? ''

  function load() {
    setLoading(true)
    getAdminUsers({ page, limit: 20, search, plan })
      .then((data) => {
        setUsers(data.users)
        setTotal(data.total)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, search, plan])

  function handleModalSaved(message: string) {
    setSuccess(message)
    load()
  }

  function handleBan(user: User) {
    if (!confirm(`Ban ${user.email}?`)) return
    patchAdminUser(user.id, { status: 'banned', version: user.version ?? 1 })
      .then(() => {
        setSuccess(`Banned ${user.email}`)
        load()
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }

  function handleSort(key: string) {
    if (key !== 'created_at' && key !== 'total_tool_uses') return
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedUsers = useMemo(() => {
    const copy = [...users]
    copy.sort((a, b) => {
      const av = sortKey === 'created_at' ? (a.created_at ?? 0) : (a.total_tool_uses ?? 0)
      const bv = sortKey === 'created_at' ? (b.created_at ?? 0) : (b.total_tool_uses ?? 0)
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return copy
  }, [users, sortKey, sortDir])

  const columns: DataTableColumn<User>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (user) => (
        <button className="link-btn" onClick={() => navigate(`/admin/users/${user.id}`)}>
          {user.email}
        </button>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (user) => {
        const badge = planBadge(user)
        return <span className={`badge ${badge.className}`}>{badge.label}</span>
      },
    },
    { key: 'role', header: 'Role', render: (user) => user.role ?? 'user' },
    { key: 'status', header: 'Status', render: (user) => user.status ?? 'active' },
    { key: 'total_tool_uses', header: 'Uses', sortable: true, render: (user) => user.total_tool_uses ?? 0 },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (user) => (user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <RowActions>
          <RowActionButton onClick={() => setManageUser(user)} title="Manage plan & credits">⚙️</RowActionButton>
          {user.status !== 'banned' && (
            <RowActionButton onClick={() => handleBan(user)} title="Ban user" variant="danger">🚫</RowActionButton>
          )}
        </RowActions>
      ),
    },
  ]

  return (
    <AdminLayout active="users">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Internal</div>
            <h1>Users</h1>
            <p>{total} total users · search, filter by plan, view detail, or manage account state.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error} <button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success} <button onClick={() => setSuccess('')}>×</button></div>}

        <DataTable
          columns={columns}
          rows={sortedUsers}
          loading={loading}
          rowKey={(user) => user.id}
          rowClassName={(user) => (user.status === 'banned' ? 'banned' : undefined)}
          emptyMessage="No users found."
          search={{
            value: searchInput,
            onChange: setSearchInput,
            onSubmit: () => setParams({ page: '1', search: searchInput, plan }),
            placeholder: 'Search by email',
          }}
          filters={{
            value: plan,
            options: [
              { value: '', label: 'All' },
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
            ],
            onChange: (value) => setParams({ page: '1', search, plan: value }),
          }}
          sort={{ key: sortKey, direction: sortDir, onChange: handleSort }}
          pagination={{ page, total, limit: 20, onPageChange: (p) => setParams({ page: String(p), search, plan }) }}
        />
      </section>

      {manageUser && (
        <ManagePlanModal
          user={manageUser}
          onClose={() => setManageUser(null)}
          onSaved={handleModalSaved}
        />
      )}
    </AdminLayout>
  )
}
