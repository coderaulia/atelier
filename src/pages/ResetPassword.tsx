import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../lib/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [validToken, setValidToken] = useState(true)

  useEffect(() => {
    const t = searchParams.get('token')
    if (!t) {
      setValidToken(false)
      return
    }
    setToken(t)
    // Remove token from URL bar to prevent Referer leakage
    window.history.replaceState({}, '', '/reset-password')
  }, [searchParams])

  if (!validToken) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28 }}>Invalid reset link</h1>
          <p style={{ color: 'var(--ink-3)', marginTop: 12 }}>
            This password reset link is invalid or missing a token.
          </p>
          <Link to="/forgot-password" className="auth-submit" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
            Request a new reset link
          </Link>
        </div>
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
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, password)
      setMessage('Password updated. You can now log in.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="eyebrow eyebrow--accent">Reset password</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, marginTop: 8 }}>Choose a new password</h1>
        <p style={{ color: 'var(--ink-3)', marginTop: 8, fontSize: 14 }}>
          Enter your new password below. This link expires in 1 hour.
        </p>

        {message ? (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <div className="auth-success">{message}</div>
            <Link to="/login" className="auth-submit" style={{ display: 'block', textAlign: 'center', marginTop: 20, textDecoration: 'none' }}>
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            {error && <div className="auth-error">{error}</div>}
            <label className="auth-label">
              New password
              <input
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                minLength={8}
              />
            </label>
            <label className="auth-label" style={{ marginTop: 16 }}>
              Confirm password
              <input
                type="password"
                className="auth-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: 20 }}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
