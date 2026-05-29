import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, updateProfile, changePassword, getSessions, signOutAll, deleteAccount, cancelSubscription, reactivateSubscription, getTransactions, getMyUsage, type User, type Session, type Transaction, type UsageLogEntry } from '../lib/api'

type Tab = 'profile' | 'subscription' | 'usage' | 'security'

export default function Account() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('profile')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token') ?? localStorage.getItem('token')
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="nav__brand">
            <span className="nav__mark" />
            <span>Atelier</span>
            <span className="nav__brand-sub">by Vanaila</span>
          </a>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow eyebrow--accent">Account</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px, 5vw, 56px)', lineHeight: 0.95, letterSpacing: '-0.04em', margin: '6px 0' }}>
            {user.email}
          </h1>
          <p style={{ color: 'var(--ink-2)', margin: 0 }}>Manage your profile, subscription, usage, and security settings.</p>
        </div>

        <div className="account-tabs">
          <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'active' : ''}>Profile</button>
          <button onClick={() => setTab('subscription')} className={tab === 'subscription' ? 'active' : ''}>Subscription</button>
          <button onClick={() => setTab('usage')} className={tab === 'usage' ? 'active' : ''}>Usage</button>
          <button onClick={() => setTab('security')} className={tab === 'security' ? 'active' : ''}>Security</button>
        </div>

        <div className="account-content">
          {tab === 'profile' && <ProfileTab user={user} onUpdate={setUser} />}
          {tab === 'subscription' && <SubscriptionTab user={user} onUpdate={setUser} />}
          {tab === 'usage' && <UsageTab user={user} />}
          {tab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  )
}

function ProfileTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [name, setName] = useState(user.name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const { user: updated } = await updateProfile(name || null)
      onUpdate(updated)
      setMessage('Profile updated')
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
      <div className="account-field">
        <label>Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      {message && <div className="account-message">{message}</div>}
      <button onClick={handleSave} disabled={saving} className="btn btn--accent">{saving ? 'Saving…' : 'Save'}</button>
    </div>
  )
}

function SubscriptionTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getTransactions().then((data) => setTransactions(data.transactions)).catch(() => {}).finally(() => setLoading(false))
  }, [])

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
          <p>Unlimited tool usage, premium templates, bulk export, and cloud save.</p>
          <button className="btn btn--accent">Upgrade now</button>
        </div>
      )}
      {user.plan === 'pro' && (
        <>
          <dl className="account-detail-list">
            <dt>Plan</dt><dd>Pro</dd>
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
    </div>
  )
}

function UsageTab({ user }: { user: User }) {
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
      localStorage.clear()
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
