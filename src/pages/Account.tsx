import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe, updateProfile, changePassword, getSessions, signOutAll, deleteAccount, cancelSubscription, reactivateSubscription, getTransactions, getMyUsage, type User, type Session, type Transaction, type UsageLogEntry } from '../lib/api'
import { getAuthToken, clearAuth, setStoredUser } from '../lib/auth'
import { EMPTY_GLOBAL_METADATA, normalizeGlobalMetadata, type GlobalMetadata } from '../lib/globalMetadata'
import BugReportForm from '../components/BugReportForm'

type Tab = 'profile' | 'subscription' | 'usage' | 'security' | 'support'

function tierLabel(tier?: string | null): string {
  switch (tier) {
    case 'starter': return 'Starter'
    case 'business': return 'Business'
    default: return 'Pro'
  }
}

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

export default function Account() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('profile')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }
    getMe(token)
      .then(({ user }) => setUser(user))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Loading account…</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', color: 'var(--ink)' }}>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow eyebrow--accent">Account</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px, 5vw, 56px)', lineHeight: 1, letterSpacing: 0, margin: '6px 0', color: 'var(--ink)' }}>
            {user.email}
          </h1>
          <p style={{ color: 'var(--ink-2)', margin: 0 }}>Manage your profile, global metadata, subscription, usage, and security settings.</p>
        </div>

        <div className="account-tabs">
          <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'active' : ''}>Profile</button>
          <button onClick={() => setTab('subscription')} className={tab === 'subscription' ? 'active' : ''}>Subscription</button>
          <button onClick={() => setTab('usage')} className={tab === 'usage' ? 'active' : ''}>Usage</button>
          <button onClick={() => setTab('security')} className={tab === 'security' ? 'active' : ''}>Security</button>
          <button onClick={() => setTab('support')} className={tab === 'support' ? 'active' : ''}>Support</button>
        </div>

        <div className="account-content">
          {tab === 'profile' && <ProfileTab user={user} onUpdate={setUser} />}
          {tab === 'subscription' && <SubscriptionTab user={user} onUpdate={setUser} />}
          {tab === 'usage' && <UsageTab user={user} />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'support' && <SupportTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
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

function SubscriptionTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
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

function UsageTab({ user: _user }: { user: User }) {
  const [usage, setUsage] = useState<UsageLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyUsage().then((data) => setUsage(data.usage)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="account-panel">
      <h2>Usage · last 30 days</h2>
      {loading && <p>Loading…</p>}
      {!loading && !usage.length && <p style={{ color: 'var(--ink-3)' }}>No usage yet.</p>}
      {!loading && usage.length > 0 && (
        <table className="account-table">
          <thead><tr><th>Date</th><th>Tool</th><th>Uses</th><th>Limit</th></tr></thead>
          <tbody>
            {usage.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.tool_id}</td>
                <td>{row.count}</td>
                <td>{row.limit ?? 'unlimited'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [showDanger, setShowDanger] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    getSessions().then((data) => setSessions(data.sessions)).catch(() => {})
  }, [])

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters')
      return
    }
    try {
      await changePassword(currentPassword, newPassword)
      setMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleSignOutAll() {
    try {
      await signOutAll()
      setMessage('Signed out all other devices')
      getSessions().then((data) => setSessions(data.sessions))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      setMessage('Type DELETE to confirm')
      return
    }
    try {
      await deleteAccount()
      clearAuth()
      window.location.href = '/'
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="account-panel">
      <h2>Change password</h2>
      <div className="account-field">
        <label>Current password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div className="account-field">
        <label>New password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div className="account-field">
        <label>Confirm new password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      {message && <div className="account-message">{message}</div>}
      <button onClick={handleChangePassword} className="btn btn--accent">Change password</button>

      <h3 style={{ marginTop: 40 }}>Active sessions</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{sessions.length} active session(s)</p>
      <button onClick={handleSignOutAll} className="btn">Sign out all other devices</button>

      <h3 style={{ marginTop: 40 }}>Danger zone</h3>
      <button onClick={() => setShowDanger(!showDanger)} className="btn">{showDanger ? 'Hide' : 'Show'} danger zone</button>
      {showDanger && (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid rgba(199,47,47,.3)', borderRadius: 12, background: 'rgba(199,47,47,.05)' }}>
          <h4 style={{ margin: '0 0 8px', color: '#b52a2a' }}>Delete account</h4>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 12px' }}>This will permanently delete your account in 30 days. You can cancel deletion by logging back in before then.</p>
          <div className="account-field">
            <label>Type DELETE to confirm</label>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          </div>
          <button onClick={handleDeleteAccount} className="btn" style={{ background: '#b52a2a', color: '#fff' }}>Delete my account</button>
        </div>
      )}
    </div>
  )
}

function SupportTab() {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="account-panel">
        <BugReportForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div className="account-panel">
      <h2>Support</h2>
      <p style={{ color: 'var(--ink-2)', marginBottom: 28 }}>
        Need help? Report a bug, ask a question, or reach out via email.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn--accent"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px 22px', height: 'auto', borderRadius: 16 }}
        >
          <span style={{ fontSize: 28, marginBottom: 10 }}>🐛</span>
          <span style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Report a Bug</span>
          <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.8 }}>Something not working? Let us know.</span>
        </button>

        <a
          href="mailto:studio@vanaila.com?subject=Support Request"
          className="btn"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px 22px', height: 'auto', borderRadius: 16, textDecoration: 'none', border: '1px solid var(--border)' }}
        >
          <span style={{ fontSize: 28, marginBottom: 10 }}>✉️</span>
          <span style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--ink)' }}>Email Support</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-2)' }}>studio@vanaila.com</span>
        </a>
      </div>

      <div style={{ padding: 16, background: 'var(--bg-2)', borderRadius: 12, fontSize: 13, color: 'var(--ink-2)' }}>
        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>Response times</strong>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
          <li>Bug reports — typically within 24 hours</li>
          <li>Email support — 1–2 business days</li>
          <li>Critical issues — prioritised immediately</li>
        </ul>
      </div>
    </div>
  )
}
