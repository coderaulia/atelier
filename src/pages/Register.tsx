import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { register } from '../lib/api'
import { setAuthToken, setStoredUser } from '../lib/auth'
import { authClient } from '../lib/auth-client'
import { useAuth } from '../hooks/useAuth'

const OAUTH_ENABLED = import.meta.env.VITE_ENABLE_OAUTH === 'true'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const plan = searchParams.get('plan') === 'pro' ? 'pro' : 'free'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    const redirect = localStorage.getItem('vs_post_auth_redirect')
    if (redirect) {
      localStorage.removeItem('vs_post_auth_redirect')
      navigate(redirect, { replace: true })
    } else if (plan === 'pro') {
      // No trial — send Pro intent straight to checkout.
      navigate('/pricing', { replace: true })
    } else {
      navigate('/app/dashboard', { replace: true })
    }
  }, [authLoading, isAuthenticated, plan, navigate])

  if (authLoading || isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
        Checking session...
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { token, user } = await register(email, password)
      setAuthToken(token)
      setStoredUser(user as unknown as Record<string, unknown>)
      // Redirect handled by the useEffect above once useAuth picks up the new session.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <div className="container nav__inner">
          <Link to="/" className="nav__brand">
            <span className="nav__mark" />
            <span>Vanaila Studio</span>
          </Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            {plan === 'pro' && (
              <div className="hero__tag" style={{ display: 'inline-flex', marginBottom: 16 }}>
                <span className="hero__tag-dot" />
                Create your account, then subscribe
              </div>
            )}
            <span className="eyebrow eyebrow--accent" style={{ display: 'block', marginBottom: 12 }}>
              {plan === 'pro' ? 'Continue to Pro' : 'Create a free account'}
            </span>
            <h1 style={{ fontFamily: 'var(--sans)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 8 }}>
              Start with <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Vanaila Studio.</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="tryit__field">
              <label>Email</label>
              <input
                className="tryit__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@work.email"
                required
                autoComplete="email"
              />
            </div>

            <div className="tryit__field">
              <label>Password</label>
              <input
                className="tryit__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(227,88,44,0.08)', border: '1px solid rgba(227,88,44,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn--accent"
              disabled={loading}
              style={{ height: 48, fontSize: 15, marginTop: 4, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : plan === 'pro' ? 'Create account & continue' : 'Create free account'}
            </button>
          </form>

          {OAUTH_ENABLED && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                OR SIGN UP WITH
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <button
                  id="register-google-button"
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/app/dashboard' })}
                  style={{ height: 48, justifyContent: 'center', width: '100%' }}
                >
                  Continue with Google
                </button>
                <button
                  id="register-github-button"
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => authClient.signIn.social({ provider: 'github', callbackURL: '/app/dashboard' })}
                  style={{ height: 48, justifyContent: 'center', width: '100%' }}
                >
                  Continue with GitHub
                </button>
              </div>
            </>
          )}

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
            FREE · NO CARD · NO WATERMARKS
          </div>
        </div>
      </div>
    </div>
  )
}
