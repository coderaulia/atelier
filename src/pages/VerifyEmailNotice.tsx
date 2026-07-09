import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resendVerificationEmail } from '../lib/api'

export default function VerifyEmailNotice() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleResend() {
    setLoading(true); setError('')
    try {
      await resendVerificationEmail()
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
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
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Verify your email</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 24 }}>
            Check your inbox for a verification link. If you didn't receive it:
          </p>
          {sent && <p style={{ fontSize: 14, color: '#16a34a', marginBottom: 16 }}>Verification email sent!</p>}
          {error && <p style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 16 }}>{error}</p>}
          <button className="btn btn--accent" style={{ height: 44, fontSize: 14, padding: '0 24px' }} onClick={handleResend} disabled={loading}>
            {loading ? 'Sending…' : 'Resend verification email'}
          </button>
        </div>
      </div>
    </div>
  )
}
