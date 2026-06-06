import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../lib/auth'
import { getMe, createCheckout } from '../lib/api'
import './Pricing.css'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: unknown) => void
        onPending?: (result: unknown) => void
        onError?: (result: unknown) => void
        onClose?: () => void
      }) => void
    }
  }
}

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

const SparkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.7 6.6L22 12l-7.3 3.4L12 22l-2.7-6.6L2 12l7.3-3.4L12 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

type UserLite = { plan: string; email: string }

type Pack = {
  id: string
  eyebrow: string
  title: string
  price: string
  unit: string
  note: string
  description: string
  badge?: string
  kind: 'soft' | 'warm' | 'dark' | 'premium'
  cta: string
  features: string[]
}

const PACKS: Pack[] = [
  {
    id: 'pro-monthly',
    eyebrow: 'Pro plan',
    title: 'Unlimited workspace',
    price: '$9',
    unit: 'per month',
    note: 'For regular creators and teams',
    description: 'For freelancers who generate documents, content, OCR, and conversions every week.',
    badge: 'Most practical',
    kind: 'premium',
    cta: 'Subscribe monthly',
    features: ['100 exports per day', 'Premium templates', 'Bulk export', 'Cancel anytime'],
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserLite | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [snapReady, setSnapReady] = useState(false)

  useEffect(() => {
    document.title = 'Pricing — Atelier by Vanaila'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Subscribe to Atelier Pro for higher daily limits, premium templates, and bulk export.')

    const token = getAuthToken()
    if (token) {
      getMe(token)
        .then(({ user }) => setUser(user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Load Midtrans Snap.js once
  useEffect(() => {
    if (document.querySelector('#midtrans-snap')) {
      setSnapReady(true)
      return
    }
    const isSandbox = import.meta.env.VITE_MIDTRANS_ENV !== 'production'
    const snapUrl = isSandbox ? 'https://app.sandbox.midtrans.com/snap/snap.js' : 'https://app.midtrans.com/snap/snap.js'
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-PLACEHOLDER'
    
    const script = document.createElement('script')
    script.id = 'midtrans-snap'
    script.src = snapUrl
    script.setAttribute('data-client-key', clientKey)
    script.onload = () => setSnapReady(true)
    script.onerror = () => console.error('Failed to load Midtrans Snap.js')
    document.body.appendChild(script)
  }, [])

  async function handlePurchase(packId: string) {
    const token = getAuthToken()
    if (!token) {
      localStorage.setItem('vs_post_auth_redirect', `/pricing?pack=${packId}`)
      navigate('/login')
      return
    }

    setProcessingPayment(packId)
    try {
      const { snap_token } = await createCheckout(packId)
      if (!window.snap) {
        alert('Payment system is loading. Please wait a moment and try again.')
        return
      }
      window.snap.pay(snap_token, {
        onSuccess: () => {
          navigate('/app/account')
        },
        onPending: () => {
          navigate('/app/account')
        },
        onError: () => {
          navigate('/pricing')
        },
        onClose: () => {
          // user closed the modal without completing
        },
      })
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setProcessingPayment(null)
    }
  }

  return (
    <main className="pricing-page">
      <nav className="pricing-nav">
        <Link to="/" className="pricing-brand">
          <span className="pricing-brand__mark" />
          <span>Atelier</span>
          <small>by Vanaila</small>
        </Link>
        <div className="pricing-nav__actions">
          {user ? <Link className="pricing-nav__pill" to="/app/dashboard">Open app</Link> : <Link className="pricing-nav__pill" to="/login">Sign in</Link>}
        </div>
      </nav>

      <section className="pricing-hero">
        <div className="pricing-hero__badge"><SparkIcon /> Free plan available</div>
        <h1>Pay for output, <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>not access.</span></h1>
        <p>
          Free tools stay useful. Pro unlocks higher daily limits, premium templates, and bulk export
          for people who produce finished files every week.
        </p>
      </section>

      <section className="pricing-free-strip" aria-label="Free plan limits">
        <div>
          <span>Free forever</span>
          <strong>Good for testing, light work, and occasional use.</strong>
        </div>
        <ul>
          <li>Daily export limits</li>
          <li>Local-only processing</li>
          <li>No file uploads to servers</li>
        </ul>
      </section>

      <section className="pricing-grid" aria-label="Paid packs">
        {PACKS.map((pack) => (
          <article key={pack.id} className={`price-card price-card--${pack.kind}`}>
            {pack.badge && <div className="price-card__badge">{pack.badge}</div>}
            <div className="price-card__eyebrow">{pack.eyebrow}</div>
            <h2>{pack.title}</h2>
            <div className="price-card__price">
              <span>{pack.price}</span>
              <small>{pack.unit}</small>
            </div>
            <div className="price-card__note">{pack.note}</div>
            <p>{pack.description}</p>
            <ul>
              {pack.features.map((feature) => (
                <li key={feature}><CheckIcon /> {feature}</li>
              ))}
            </ul>
            <button className="price-card__cta" onClick={() => handlePurchase(pack.id)} disabled={loading || processingPayment === pack.id || !snapReady}>
              {processingPayment === pack.id ? 'Opening checkout…' : pack.cta} <ArrowIcon />
            </button>
          </article>
        ))}
      </section>

      <section className="pricing-guidance">
        <div>
          <span>Recommended model</span>
          <h2>Use Pro for regular production work.</h2>
        </div>
        <div className="pricing-guidance__cards">
          <div><strong>Free plan</strong><p>Good for testing, light work, and occasional use with daily limits.</p></div>
          <div><strong>$9/mo Pro</strong><p>Best for freelancers and creators who export finished files every week.</p></div>
          <div><strong>Cancel anytime</strong><p>Subscription access stays active through the paid period after cancellation.</p></div>
        </div>
      </section>

      <footer className="pricing-footer">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/refund">Refund</Link>
      </footer>
    </main>
  )
}
