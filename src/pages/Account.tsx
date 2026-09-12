import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, type User } from '../lib/api';
import { getAuthToken } from '../lib/auth';
import { ProfileTab } from './Account/tabs/ProfileTab';
import { SubscriptionTab } from './Account/tabs/SubscriptionTab';
import { UsageTab } from './Account/tabs/UsageTab';
import { SecurityTab } from './Account/tabs/SecurityTab';
import { SupportTab } from './Account/tabs/SupportTab';

type Tab = 'profile' | 'subscription' | 'usage' | 'security' | 'support';

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
