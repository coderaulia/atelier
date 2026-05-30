import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LanguageToggle from '@/components/LanguageToggle'
import './marketing-nav.css'

interface MarketingNavProps {
  showGoToApp?: boolean
}

export default function MarketingNav({ showGoToApp = true }: MarketingNavProps) {
  const { isAuthenticated } = useAuth()

  return (
    <header className="marketing-nav">
      <div className="marketing-nav__container">
        <Link to="/" className="marketing-nav__brand">
          <span className="marketing-nav__logo">V</span>
          <span>
            <strong>Vanaila</strong>
            <small>Studio</small>
          </span>
        </Link>

        <nav className="marketing-nav__links" aria-label="Main navigation">
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
