import { useState, useRef, useEffect } from 'react'
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dropdownOpen])

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
          <span className="app-topbar__hamburger-icon" aria-hidden="true" />
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

        <div className="app-topbar__avatar-wrap" ref={dropdownRef}>
          <button
            className="app-topbar__avatar"
            type="button"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </button>

          {dropdownOpen && (
            <div className="app-topbar__dropdown" role="menu">
              <div className="app-topbar__dropdown-header">
                <span>{user?.name || user?.email}</span>
              </div>
              <Link to="/app/account" className="app-topbar__dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                My Account
              </Link>
              <div className="app-topbar__dropdown-divider" />
              <button
                type="button"
                className="app-topbar__dropdown-item app-topbar__dropdown-item--danger"
                role="menuitem"
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
