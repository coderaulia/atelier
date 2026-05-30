import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  getAdminAnnouncements,
  createAdminAnnouncement,
  updateAdminAnnouncement,
  deleteAdminAnnouncement,
  type Announcement,
} from '../../lib/api'

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as 'info' | 'warning' | 'success' | 'error', target: 'all' as 'all' | 'free' | 'pro' })

  function load() {
    setLoading(true)
    getAdminAnnouncements()
      .then((data) => setItems(data.announcements))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate() {
    try {
      await createAdminAnnouncement(form)
      setSuccess('Announcement created')
      setShowForm(false)
      setForm({ title: '', message: '', type: 'info', target: 'all' })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function toggleActive(item: Announcement) {
    try {
      await updateAdminAnnouncement(item.id, { is_active: !item.is_active })
      setSuccess(`${item.title} ${item.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleDelete(item: Announcement) {
    if (!confirm(`Delete announcement "${item.title}"?`)) return
    try {
      await deleteAdminAnnouncement(item.id)
      setSuccess('Announcement deleted')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const colors: Record<string, string> = { info: 'rgba(59,130,246,.12)', warning: 'rgba(234,179,8,.12)', success: 'rgba(34,197,94,.12)', error: 'rgba(220,38,38,.12)' }

  return (
    <AdminLayout active="announcements">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Content</div>
            <h1>Announcements</h1>
            <p>Manage in-app announcements visible to users based on plan and schedule.</p>
          </div>
          <button className="btn btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Announcement'}
          </button>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}

        {showForm && (
          <div className="admin-panel" style={{ marginBottom: 20 }}>
            <div className="admin-form-row"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="admin-form-row"><label>Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} /></div>
            <div className="admin-grid-2">
              <div className="admin-form-row"><label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
                  <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option>
                </select>
              </div>
              <div className="admin-form-row"><label>Target</label>
                <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as typeof form.target })}>
                  <option value="all">All Users</option><option value="free">Free Only</option><option value="pro">Pro Only</option>
                </select>
              </div>
            </div>
            <button className="btn btn--accent" onClick={handleCreate}>Create Announcement</button>
          </div>
        )}

        {loading && <p>Loading...</p>}

        {!loading && !items.length && <p style={{ color: 'var(--ink-3)' }}>No announcements yet.</p>}

        {!loading && items.map((item) => (
          <div key={item.id} className="admin-panel" style={{ marginBottom: 12, borderLeft: `4px solid ${colors[item.type] ?? 'var(--border)'}`, opacity: item.is_active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <strong>{item.title}</strong>
                  <span className={`status status--${item.type === 'info' ? 'new' : item.type === 'warning' ? 'in_progress' : item.type === 'success' ? 'success' : 'failed'}`}>{item.type}</span>
                  <span className="badge badge--free">{item.target}</span>
                </div>
                <p style={{ margin: '0 0 8px', color: 'var(--ink-2)' }}>{item.message}</p>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Created {new Date(item.created_at * 1000).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => toggleActive(item)} title={item.is_active ? 'Deactivate' : 'Activate'}>
                  {item.is_active ? '✓' : '○'}
                </button>
                <button onClick={() => handleDelete(item)} title="Delete" style={{ color: '#b52a2a' }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </AdminLayout>
  )
}
