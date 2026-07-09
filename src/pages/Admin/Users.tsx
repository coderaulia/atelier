import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import ManagePlanModal from './ManagePlanModal'
import { getAdminUsers, patchAdminUser, type User } from '../../lib/api'

function planBadge(user: User): { label: string; className: string } {
  if (user.plan !== 'pro') return { label: 'Free', className: 'badge--free' }
  const tier = user.pro_tier ?? 'pro'
  return { label: `Pro · ${tier}`, className: `badge--${tier}` }
}

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setParams({ page: '1', search: searchInput, plan })
  }

  function handleModalSaved(message: string) {
    setSuccess(message)
    load()
  }

  function handleBan(user: User) {
    if (!confirm(`Ban ${user.email}?`)) return
    patchAdminUser(user.id, { status: 'banned' })
      .then(() => {
        setSuccess(`Banned ${user.email}`)
        load()
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
  }

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

        <div className="admin-toolbar">
          <form onSubmit={handleSearch} className="admin-search">
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by email" />
            <button type="submit">Search</button>
          </form>
          <div className="admin-pill-group">
            <button onClick={() => setParams({ page: '1', search, plan: '' })} className={plan === '' ? 'active' : ''}>All</button>
            <button onClick={() => setParams({ page: '1', search, plan: 'free' })} className={plan === 'free' ? 'active' : ''}>Free</button>
            <button onClick={() => setParams({ page: '1', search, plan: 'pro' })} className={plan === 'pro' ? 'active' : ''}>Pro</button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Plan</th>
                <th>Role</th>
                <th>Status</th>
                <th>Uses</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7}>Loading…</td></tr>}
              {!loading && !users.length && <tr><td colSpan={7}>No users found.</td></tr>}
              {!loading && users.map((user) => {
                const badge = planBadge(user)
                return (
                <tr key={user.id} className={user.status === 'banned' ? 'banned' : ''}>
                  <td><button className="link-btn" onClick={() => navigate(`/admin/users/${user.id}`)}>{user.email}</button></td>
                  <td><span className={`badge ${badge.className}`}>{badge.label}</span></td>
                  <td>{user.role ?? 'user'}</td>
                  <td>{user.status ?? 'active'}</td>
                  <td>{user.total_tool_uses ?? 0}</td>
                  <td>{user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="admin-btn-icon" onClick={() => setManageUser(user)} title="Manage plan & credits" aria-label="Manage plan and credits">⚙️</button>
                      {user.status !== 'banned' && (
                        <button className="admin-btn-icon admin-btn-icon--danger" onClick={() => handleBan(user)} title="Ban user" aria-label="Ban user">🚫</button>
                      )}
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setParams({ page: String(page - 1), search, plan })}>← Prev</button>
          <span>Page {page} / {Math.ceil(total / 20) || 1}</span>
          <button disabled={(page * 20) >= total} onClick={() => setParams({ page: String(page + 1), search, plan })}>Next →</button>
        </div>
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
