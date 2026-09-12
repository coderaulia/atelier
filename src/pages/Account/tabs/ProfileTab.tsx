import { useState } from 'react';
import { updateProfile, type User } from '../../../lib/api';
import { setStoredUser } from '../../../lib/auth';
import { EMPTY_GLOBAL_METADATA, normalizeGlobalMetadata, type GlobalMetadata } from '../../../lib/globalMetadata';

const identityFields: Array<{ key: keyof GlobalMetadata; label: string; placeholder: string; type?: string }> = [
  { key: 'company_name', label: 'Company / brand name', placeholder: 'Vanaila Studio' },
  { key: 'username', label: 'Username', placeholder: 'auliaw89' },
  { key: 'email', label: 'Public email', placeholder: 'hello@example.com', type: 'email' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com', type: 'url' },
  { key: 'profile_image_url', label: 'Profile picture URL', placeholder: 'https://example.com/avatar.png', type: 'url' },
  { key: 'company_logo_url', label: 'Company logo URL', placeholder: 'https://example.com/logo.png', type: 'url' },
]

const socialFields: Array<{ key: keyof GlobalMetadata; label: string; placeholder: string; type?: string }> = [
  { key: 'social_handle', label: 'Default social handle', placeholder: '@yourbrand' },
  { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/yourbrand', type: 'url' },
  { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourbrand', type: 'url' },
  { key: 'x_url', label: 'X / Twitter URL', placeholder: 'https://x.com/yourbrand', type: 'url' },
  { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/yourbrand', type: 'url' },
  { key: 'tiktok_url', label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourbrand', type: 'url' },
  { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/@yourbrand', type: 'url' },
]

export function ProfileTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [name, setName] = useState(user.name ?? '')
  const [metadata, setMetadata] = useState<GlobalMetadata>(() => normalizeGlobalMetadata(user.global_metadata ?? EMPTY_GLOBAL_METADATA))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const setMeta = (key: keyof GlobalMetadata, value: string) => {
    setMetadata((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const { user: updated } = await updateProfile(name || null, metadata, user.version ?? 1)
      onUpdate(updated)
      setStoredUser(updated as unknown as Record<string, unknown>)
      setMetadata(normalizeGlobalMetadata(updated.global_metadata))
      setMessage('Profile and global metadata updated')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-panel">
      <h2>Profile</h2>
      <dl className="account-detail-list">
        <dt>Email</dt><dd>{user.email}</dd>
        <dt>Plan</dt><dd><span className={`badge badge--${user.plan}`}>{user.plan}</span></dd>
        <dt>Member since</dt><dd>{user.created_at ? new Date(user.created_at * 1000).toLocaleDateString() : '—'}</dd>
      </dl>
      <div className="account-settings-grid">
        <section className="account-settings-section">
          <h3>Account identity</h3>
          <div className="account-field">
            <label>Display name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="account-form-grid">
            {identityFields.map((field) => (
              <div className="account-field" key={field.key}>
                <label>{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  value={metadata[field.key]}
                  onChange={(e) => setMeta(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="account-settings-section">
          <h3>Document generator defaults</h3>
          <div className="account-form-grid">
            <div className="account-field">
              <label>Default signatory</label>
              <input
                value={metadata.document_signatory}
                onChange={(e) => setMeta('document_signatory', e.target.value)}
                placeholder="Name shown on proposals and invoices"
              />
            </div>
            <div className="account-field">
              <label>Tax ID / business number</label>
              <input
                value={metadata.tax_id}
                onChange={(e) => setMeta('tax_id', e.target.value)}
                placeholder="NPWP, EIN, VAT, etc."
              />
            </div>
          </div>
          <div className="account-field account-field--wide">
            <label>Company address</label>
            <textarea
              value={metadata.company_address}
              onChange={(e) => setMeta('company_address', e.target.value)}
              placeholder="Street, city, country"
              rows={3}
            />
          </div>
          <div className="account-field account-field--wide">
            <label>Payment details</label>
            <textarea
              value={metadata.payment_details}
              onChange={(e) => setMeta('payment_details', e.target.value)}
              placeholder="Bank transfer, Wise, PayPal, payment terms"
              rows={4}
            />
          </div>
        </section>

        <section className="account-settings-section">
          <h3>Social media defaults</h3>
          <div className="account-form-grid">
            {socialFields.map((field) => (
              <div className="account-field" key={field.key}>
                <label>{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  value={metadata[field.key]}
                  onChange={(e) => setMeta(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
      {message && <div className="account-message">{message}</div>}
      <button onClick={handleSave} disabled={saving} className="btn btn--accent">{saving ? 'Saving…' : 'Save'}</button>
    </div>
  )
}

