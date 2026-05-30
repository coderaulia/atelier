import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'
import { usePlan } from '@/hooks/usePlan'
import { getToolByAppPath } from '@/lib/tools'
import { TOOL_CATEGORIES } from '@/lib/tools'
import './topbar.css'

export default function TopBar() {
  const { setSidebarOpen } = useAppContext()
  const { user, logout } = useAuth()
  const { isPro } = usePlan()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const activeTool = getToolByAppPath(location.pathname)
  const breadcrumb = buildBreadcrumb(location.pathname, activeTool)

  return (
    <header className="app-topbar">
      <div className="app-topbar__left">
        <button
          className="app-topbar__hamburger"
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <nav className="app-topbar__breadcrumb" aria-label="Breadcrumb">
          {breadcrumb}
        </nav>
      </div>

      <div className="app-topbar__right">
        {!isPro && (
          <button
            className="app-topbar__upgrade-btn"
            type="button"
            onClick={() => navigate('/pricing')}
          >
            Upgrade to Pro ✨
          </button>
        )}

        <div className="app-topbar__avatar-wrap" onMouseLeave={() => setDropdownOpen(false)}>
          <button
            className="app-topbar__avatar"
            type="button"
            aria-label="User menu"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </button>

          {dropdownOpen && (
            <div className="app-topbar__dropdown">
              <div className="app-topbar__dropdown-header">
                <span>{user?.name || user?.email}</span>
              </div>
              <Link to="/app/account" className="app-topbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                My Account
              </Link>
              <div className="app-topbar__dropdown-divider" />
              <button
                type="button"
                className="app-topbar__dropdown-item app-topbar__dropdown-item--danger"
                onClick={() => { setDropdownOpen(false); logout() }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function buildBreadcrumb(
  pathname: string,
  tool: ReturnType<typeof getToolByAppPath>
): React.ReactNode {
  if (pathname === '/app/dashboard' || pathname === '/app') {
    return <span className="app-topbar__bc-current">Dashboard</span>
  }

  if (tool) {
    const categoryMeta = TOOL_CATEGORIES[tool.category]
    return (
      <>
        <span className="app-topbar__bc-parent">{categoryMeta.label}</span>
        <span className="app-topbar__bc-sep" aria-hidden>›</span>
        <span className="app-topbar__bc-current">{tool.name}</span>
      </>
    )
  }

  return <span className="app-topbar__bc-current">App</span>
}
