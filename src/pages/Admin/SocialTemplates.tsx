import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import RowActions, { RowActionButton } from '../../components/admin/RowActions'
import {
  getAdminSocialTemplates, publishSocialTemplate, disableSocialTemplate, deleteSocialTemplate,
  type SocialTemplateRow,
} from '../../lib/api'

const STATUS_COLOR: Record<string, string> = {
  published: 'rgba(34,197,94,.5)',
  draft: 'rgba(234,179,8,.5)',
  disabled: 'rgba(148,163,184,.5)',
}

export default function SocialTemplates() {
  const navigate = useNavigate()
  const [items, setItems] = useState<SocialTemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    getAdminSocialTemplates()
      .then((data) => setItems(data.templates))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function togglePublish(t: SocialTemplateRow) {
    try {
      if (t.status === 'published') { await disableSocialTemplate(t.id); setSuccess(`${t.name} disabled`) }
      else { await publishSocialTemplate(t.id); setSuccess(`${t.name} published`) }
      load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  async function handleDelete(t: SocialTemplateRow) {
    if (!confirm(`Delete template "${t.name}"? This cannot be undone.`)) return
    try {
      await deleteSocialTemplate(t.id)
      setSuccess('Template deleted')
      load()
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  return (
    <AdminLayout active="social-templates">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Content</div>
            <h1>Social Templates</h1>
            <p>Runtime templates for the social generator. Publish to make one live for users — no redeploy needed.</p>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={() => navigate('/admin/content/social-templates/new')}>
            + New Template
          </button>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}

        {loading && <p>Loading…</p>}
        {!loading && !items.length && (
          <div className="admin-panel">
            <p style={{ color: 'var(--ink-3)', margin: 0 }}>
              No runtime templates yet. Click <strong>+ New Template</strong> to author one, or paste an HTML file into the editor and hit “Detect fields”.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="admin-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--ink-3)', borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>Name</th><th style={th}>Kind</th><th style={th}>Status</th>
                  <th style={th}>Pro</th><th style={th}>Ver</th><th style={th}>Updated</th><th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/content/social-templates/${t.id}`)}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{t.id}</div>
                    </td>
                    <td style={td}>{t.kind}</td>
                    <td style={td}>
                      <span className="badge" style={{ borderLeft: `3px solid ${STATUS_COLOR[t.status ?? 'draft']}`, paddingLeft: 8 }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={td}>{t.is_pro ? 'Pro' : '—'}</td>
                    <td style={td}>{t.version}</td>
                    <td style={{ ...td, fontSize: 12, color: 'var(--ink-3)' }}>
                      {t.updated_at ? new Date(t.updated_at * 1000).toLocaleDateString() : '—'}
                    </td>
                    <td style={td} onClick={(e) => e.stopPropagation()}>
                      <RowActions>
                        <RowActionButton onClick={() => togglePublish(t)} title={t.status === 'published' ? 'Disable' : 'Publish'}
                          variant={t.status === 'published' ? 'default' : 'success'}>
                          {t.status === 'published' ? '○' : '✓'}
                        </RowActionButton>
                        <RowActionButton onClick={() => navigate(`/admin/content/social-templates/${t.id}`)} title="Edit">✎</RowActionButton>
                        <RowActionButton onClick={() => handleDelete(t)} title="Delete" variant="danger">✕</RowActionButton>
                      </RowActions>
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

const th: React.CSSProperties = { padding: '12px 16px', fontWeight: 600 }
const td: React.CSSProperties = { padding: '12px 16px', verticalAlign: 'top' }
