import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getSystemConfig, updateSystemConfig, type SystemConfig } from '../../lib/api'

export default function SystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    getSystemConfig()
      .then((data) => setConfig(data.config))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function startEdit(item: SystemConfig) {
    setEditing(item.key)
    setEditValue(item.value)
  }

  async function save(key: string) {
    const item = config.find((entry) => entry.key === key)
    if (!item) return
    try {
      await updateSystemConfig(key, editValue, item.version)
      setSuccess(`Updated ${key}`)
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  return (
    <AdminLayout active="system-config">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">System</div>
            <h1>Configuration</h1>
            <p>Manage platform settings, rate limits, and operational parameters.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}

        {loading && <p>Loading...</p>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Key</th><th>Value</th><th>Type</th><th>Description</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {config.map((item) => (
                  <tr key={item.key}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{item.key}</td>
                    <td>
                      {editing === item.key ? (
                        <input
                          type={item.type === 'number' ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', fontSize: 13 }}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{item.value}</span>
                      )}
                    </td>
                    <td><span className="badge badge--free">{item.type}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--ink-2)', maxWidth: 300 }}>{item.description ?? '—'}</td>
                    <td>
                      {editing === item.key ? (
                        <>
                          <button onClick={() => save(item.key)} style={{ marginRight: 4 }}>✓</button>
                          <button onClick={() => setEditing(null)}>✕</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(item)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  )
}
