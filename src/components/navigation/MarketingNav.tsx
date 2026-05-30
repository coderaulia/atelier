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
    <header className="marketing-nav">
      <div className="marketing-nav__container">
        <Link to="/" className="marketing-nav__brand">
          <span className="marketing-nav__logo">V</span>
          <span>
            <strong>Atelier</strong>
            <small>Vanaila</small>
          </span>
        </Link>

        <nav className="marketing-nav__links" aria-label="Main navigation">
          {/* Tools dropdown */}
          <div className="marketing-nav__dropdown" ref={dropdownRef}>
            <button
              className="marketing-nav__link marketing-nav__dropdown-trigger"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              type="button"
            >
              Tools
              <span className={`marketing-nav__chevron ${dropdownOpen ? 'open' : ''}`}>▾</span>
            </button>
            {dropdownOpen && (
              <div className="marketing-nav__dropdown-panel">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.publicPath}
                    className="marketing-nav__dropdown-item"
                  >
                    <span className="marketing-nav__dropdown-item-icon">{tool.icon}</span>
                    <div className="marketing-nav__dropdown-item-content">
                      <span className="marketing-nav__dropdown-item-name">{tool.name}</span>
                      <span className="marketing-nav__dropdown-item-desc">{tool.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/pricing" className="marketing-nav__link">
            Pricing
          </Link>
          <LanguageToggle />
          {isAuthenticated && showGoToApp ? (
            <Link to="/app/dashboard" className="marketing-nav__cta">
              Go to App →
            </Link>
          ) : (
            <>
              <Link to="/login" className="marketing-nav__link">
                Login
              </Link>
              <Link to="/register" className="marketing-nav__cta">
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
