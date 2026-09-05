import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../lib/api'
import MarketingNav from '@/components/navigation/MarketingNav'
import MarketingFooter from '@/components/navigation/MarketingFooter'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRequestReset(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSuccess('If an account exists with that email, a reset link has been sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await resetPassword(resetToken!, password)
      setSuccess('Password reset successfully! Redirecting to login…')
      setTimeout(() => { window.location.href = '/login' }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <MarketingNav />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {resetToken ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <span className="eyebrow eyebrow--accent" style={{ display: 'block', marginBottom: 12 }}>Reset password</span>
                <h1 style={{ fontFamily: 'var(--sans)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  Create a new password
                </h1>
              </div>
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="tryit__field">
                  <label>New password</label>
                  <input className="tryit__input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" required minLength={8} autoComplete="new-password" />
                </div>
                <div className="tryit__field">
                  <label>Confirm password</label>
                  <input className="tryit__input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="8+ characters" required minLength={8} autoComplete="new-password" />
                </div>
                {error && <div style={{ padding: '10px 14px', background: 'rgba(227,88,44,0.08)', border: '1px solid rgba(227,88,44,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>{error}</div>}
                {success && <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, fontSize: 13, color: '#16a34a' }}>{success}</div>}
                <button type="submit" className="btn btn--accent" disabled={loading} style={{ height: 48, fontSize: 15, marginTop: 4, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <span className="eyebrow eyebrow--accent" style={{ display: 'block', marginBottom: 12 }}>Forgot password</span>
                <h1 style={{ fontFamily: 'var(--sans)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  Reset your password
                </h1>
                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 8 }}>
                  Enter your email and we'll send a reset link.
                </p>
              </div>
              <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="tryit__field">
                  <label>Email</label>
                  <input className="tryit__input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@work.email" required autoComplete="email" />
                </div>
                {error && <div style={{ padding: '10px 14px', background: 'rgba(227,88,44,0.08)', border: '1px solid rgba(227,88,44,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--accent)' }}>{error}</div>}
                {success && <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, fontSize: 13, color: '#16a34a' }}>{success}</div>}
                <button type="submit" className="btn btn--accent" disabled={loading} style={{ height: 48, fontSize: 15, marginTop: 4, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <p style={{ marginTop: 24, fontSize: 14, color: 'var(--ink-3)', textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <MarketingFooter />
    </div>
  )
}
