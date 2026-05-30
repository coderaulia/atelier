import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function SidebarFooter() {
  const { user } = useAuth()
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()
  const plan = user?.plan ?? 'free'

  return (
    <div className="sidebar-footer">
      <Link to="/app/account" className="sidebar-footer__profile">
        <span className="sidebar-footer__avatar">{initial}</span>
        <span className="sidebar-footer__meta">
          <span className="sidebar-footer__name">{displayName}</span>
          <span className={`sidebar-footer__plan sidebar-footer__plan--${plan}`}>
            {plan === 'pro' ? 'Pro' : 'Free'} plan
          </span>
        </span>
      </Link>
    </div>
  )
}
