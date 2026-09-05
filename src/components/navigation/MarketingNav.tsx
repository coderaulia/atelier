import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LanguageToggle from '@/components/LanguageToggle'
import { TOOLS } from '@/lib/tools'
import './marketing-nav.css'

interface MarketingNavProps {
  showGoToApp?: boolean
}

export default function MarketingNav({ showGoToApp = true }: MarketingNavProps) {
  const { isAuthenticated } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  return (
    <nav className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__mark" />
          <span>Vanaila Studio</span>
        </Link>

        <div className="nav__links">
          <div className="nav__dropdown" ref={dropdownRef}>
            <button
              className="nav__link nav__dropdown-trigger"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              Tools
              <span className={`nav__chevron ${dropdownOpen ? 'open' : ''}`}>▾</span>
            </button>
            {dropdownOpen && (
              <div className="nav__dropdown-panel">
                {TOOLS.map((tool) => (
                  <Link key={tool.id} to={tool.publicPath} className="nav__dropdown-item">
                    <span className="nav__dropdown-item-icon">{tool.icon}</span>
                    <div className="nav__dropdown-item-content">
                      <span className="nav__dropdown-item-name">{tool.name}</span>
                      <span className="nav__dropdown-item-desc">{tool.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link className="nav__link" to="/pricing">Pricing</Link>
          <Link className="nav__link" to="/about">About</Link>
          <Link className="nav__link" to="/faq">FAQ</Link>
        </div>

        <div className="nav__actions">
          <LanguageToggle />
          {isAuthenticated && showGoToApp ? (
            <Link className="btn btn--primary" to="/app/dashboard">Go to app →</Link>
          ) : (
            <>
              <Link className="nav__link" to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
              <Link className="btn btn--primary" to="/register">Sign up free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
