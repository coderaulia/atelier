import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../lib/api'
import { setAuthToken, setStoredUser } from '../lib/auth'
import { authClient } from '../lib/auth-client'

const OAUTH_ENABLED = import.meta.env.VITE_ENABLE_OAUTH === 'true'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await login(email, password)
      setAuthToken(token)
      setStoredUser(user as unknown as Record<string, unknown>)
      const redirect = localStorage.getItem('vs_post_auth_redirect')
      if (redirect) {
        localStorage.removeItem('vs_post_auth_redirect')
        navigate(redirect)
      } else if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/app/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
            <span>Atelier</span>
            <span className="nav__brand-sub">by Vanaila</span>
          </Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <span className="eyebrow eyebrow--accent" style={{ display: 'block', marginBottom: 12 }}>Welcome back</span>
            <h1 style={{ fontFamily: 'var(--sans)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 8 }}>
              Sign in to <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Atelier.</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one free</Link>
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, display: 'inline-block' }}>
                Forgot password?
              </Link>
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {OAUTH_ENABLED && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                OR CONTINUE WITH
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <button
                  id="login-google-button"
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/app/dashboard' })}
                  style={{ height: 48, justifyContent: 'center', width: '100%' }}
                >
                  Continue with Google
                </button>
                <button
                  id="login-github-button"
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
