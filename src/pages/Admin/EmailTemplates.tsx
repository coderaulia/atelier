import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAdminEmailTemplates, updateAdminEmailTemplate, type EmailTemplate } from '../../lib/api'

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ subject: '', html_body: '' })

  function load() {
    setLoading(true)
    getAdminEmailTemplates()
      .then((data) => setTemplates(data.templates))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function save(key: string) {
    try {
      await updateAdminEmailTemplate(key, form)
      setSuccess(`Saved template: ${key}`)
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  function startEdit(t: EmailTemplate) {
    setEditing(t.template_key)
    setForm({ subject: t.subject ?? '', html_body: t.html_body ?? '' })
  }

  const defaultTemplates = [
    ['welcome', 'Welcome to Vanaila Studio'],
    ['email-verify', 'Verify your email'],
    ['password-reset', 'Reset your password'],
    ['subscription-confirmed', 'Subscription confirmed'],
    ['subscription-cancelled', 'Subscription cancelled'],
    ['payment-failed', 'Payment failed'],
  ]

  const allTemplates = [...defaultTemplates.map(([key, name]) => {
    const existing = templates.find((t) => t.template_key === key)
    return { template_key: key, name, subject: existing?.subject ?? null, html_body: existing?.html_body ?? null, isOverride: !!existing }
  })]

  return (
    <AdminLayout active="email-templates">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">Content</div>
            <h1>Email Templates</h1>
            <p>Preview and override default email templates used by the system.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}

        {loading && <p>Loading...</p>}

        {!loading && (
          <div style={{ display: 'grid', gap: 16 }}>
            {allTemplates.map((t) => (
              <div key={t.template_key} className="admin-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--mono)', fontSize: 14 }}>{t.template_key}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>{t.name}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {t.isOverride && <span className="badge badge--pro">custom</span>}
                    {editing === t.template_key ? (
                      <>
                        <button className="admin-btn admin-btn--primary" onClick={() => save(t.template_key)}>Save</button>
                        <button className="admin-btn" onClick={() => setEditing(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="admin-btn" onClick={() => startEdit(t)}>Edit</button>
                    )}
                  </div>
                </div>

                {editing === t.template_key && (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div className="admin-form-row"><label>Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                    <div className="admin-form-row"><label>HTML Body</label><textarea value={form.html_body} onChange={(e) => setForm({ ...form, html_body: e.target.value })} rows={12} style={{ fontFamily: 'monospace', fontSize: 12 }} /></div>
                  </div>
                )}

                {editing !== t.template_key && (
                  <div style={{ padding: '8px 12px', background: 'var(--bg-2)', borderRadius: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                    {t.subject ? `Subject: ${t.subject}` : 'Using default system template'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}
