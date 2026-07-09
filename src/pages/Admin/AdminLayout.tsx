import { ReactNode, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMe } from '../../lib/api'
import { getAuthToken } from '../../lib/auth'

interface AdminLayoutProps {
  children: ReactNode
  active: 'overview' | 'users' | 'transactions' | 'subscriptions' | 'refunds' | 'bug-reports' | 'revenue' | 'analytics' | 'system-config' | 'feature-flags' | 'health' | 'announcements' | 'email-templates' | 'audit-logs' | 'errors'
}

export default function AdminLayout({ children, active }: AdminLayoutProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      localStorage.setItem('vs_post_auth_redirect', '/admin')
      navigate('/login')
      return
    }
    getMe(token)
      .then(({ user }) => {
        if (user.role !== 'admin') {
          navigate('/')
          return
        }
        setEmail(user.email)
        setLoading(false)
      })
      .catch(() => {
        localStorage.setItem('vs_post_auth_redirect', '/admin')
        navigate('/login')
      })
  }, [navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Loading admin…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <aside style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)' }}>
            <span className="nav__mark" style={{ width: 24, height: 24 }} />
            <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600 }}>Vanaila Studio</span>
          </Link>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>ADMIN PANEL</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <NavLink to="/admin" active={active === 'overview'}>Overview</NavLink>
          
          <NavSection>Users & Billing</NavSection>
          <NavLink to="/admin/users" active={active === 'users'}>Users</NavLink>
          <NavLink to="/admin/transactions" active={active === 'transactions'}>Transactions</NavLink>
          <NavLink to="/admin/subscriptions" active={active === 'subscriptions'}>Subscriptions</NavLink>
          <NavLink to="/admin/refunds" active={active === 'refunds'}>Refunds</NavLink>

          <NavSection>Support</NavSection>
          <NavLink to="/admin/bug-reports" active={active === 'bug-reports'}>Bug Reports</NavLink>

          <NavSection>Analytics</NavSection>
          <NavLink to="/admin/analytics" active={active === 'analytics'}>Dashboard</NavLink>
          <NavLink to="/admin/revenue" active={active === 'revenue'}>Revenue</NavLink>

          <NavSection>System</NavSection>
          <NavLink to="/admin/system/config" active={active === 'system-config'}>Config</NavLink>
          <NavLink to="/admin/system/features" active={active === 'feature-flags'}>Features</NavLink>
          <NavLink to="/admin/system/health" active={active === 'health'}>Health</NavLink>

          <NavSection>Content</NavSection>
          <NavLink to="/admin/content/announcements" active={active === 'announcements'}>Announcements</NavLink>
          <NavLink to="/admin/content/email-templates" active={active === 'email-templates'}>Email Templates</NavLink>

          <NavSection>Monitoring</NavSection>
          <NavLink to="/admin/audit-logs" active={active === 'audit-logs'}>Audit Logs</NavLink>
          <NavLink to="/admin/errors" active={active === 'errors'}>Errors</NavLink>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-3)' }}>
          {email}
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '10px 12px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : 'var(--ink-2)',
        background: active ? 'rgba(227,88,44,0.08)' : 'transparent',
        textDecoration: 'none',
        marginBottom: 4,
      }}
    >
      {children}
    </Link>
  )
}

function NavSection({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--ink-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '16px 12px 8px',
        marginTop: 8,
      }}
    >
      {children}
    </div>
  )
}
