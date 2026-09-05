import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAuthToken } from '../lib/auth'
import { getMe, createCheckout, createPackCheckout, getPricing, type Pricing as PricingData } from '../lib/api'
import MarketingNav from '../components/navigation/MarketingNav'
import MarketingFooter from '../components/navigation/MarketingFooter'
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

type Currency = 'IDR' | 'USD'
type Tier = 'starter' | 'pro' | 'business'
type PackId = 'cv-10' | 'social-50'

type Plan = {
  id: Tier
  eyebrow: string
  title: string
  unit: string
  note: string
  description: string
  badge?: string
  kind: 'soft' | 'warm' | 'dark' | 'premium'
  cta: string
  features: string[]
}

type Pack = {
  id: PackId
  title: string
  description: string
}

// Copy/features only — prices come live from GET /billing/pricing (api/src/lib/pricing.ts, canonical).
const PLANS: Plan[] = [
  {
    id: 'starter',
    eyebrow: 'Starter',
    title: 'For occasional exports',
    unit: 'per month',
    note: 'Light, regular use',
    description: 'For people who need more than the free daily limit, without full production volume.',
    kind: 'soft',
    cta: 'Subscribe monthly',
    features: ['30 exports per day', 'No watermark', 'Cancel anytime'],
  },
  {
    id: 'pro',
    eyebrow: 'Pro plan',
    title: 'Unlimited workspace',
    unit: 'per month',
    note: 'For regular creators and teams',
    description: 'For freelancers who generate documents, content, OCR, and conversions every week.',
    badge: 'Most practical',
    kind: 'premium',
    cta: 'Subscribe monthly',
    features: ['100 exports per day', 'Premium templates', 'Bulk export', 'Cancel anytime'],
  },
  {
    id: 'business',
    eyebrow: 'Business',
    title: 'For high-volume production',
    unit: 'per month',
    note: 'Highest daily volume',
    description: 'For studios and teams producing client-facing files at scale, every day.',
    kind: 'dark',
    cta: 'Subscribe monthly',
    features: ['300 exports per day', 'Premium templates', 'Bulk export', 'Priority support'],
  },
]

const PACKS: Pack[] = [
  {
    id: 'cv-10',
    title: 'CV credit pack',
    description: '10 CV exports, no watermark. Credits never expire and apply on top of your daily limit.',
  },
  {
    id: 'social-50',
    title: 'Social credit pack',
    description: '50 social post exports, no watermark. Credits never expire and apply on top of your daily limit.',
  },
]

// Fallback shown only if the live pricing fetch fails — kept in sync manually as a safety net.
const FALLBACK_PRICING: PricingData = {
  pro: {
    starter: { idr: { amount: 49000, currency: 'IDR', display: 'IDR 49,000' }, usd: { amount: 5, currency: 'USD', display: '$5' } },
    pro: { idr: { amount: 99000, currency: 'IDR', display: 'IDR 99,000' }, usd: { amount: 9, currency: 'USD', display: '$9' } },
    business: { idr: { amount: 249000, currency: 'IDR', display: 'IDR 249,000' }, usd: { amount: 22, currency: 'USD', display: '$22' } },
  },
  packs: {
    'cv-10': { credits: 10, idr: { amount: 64000, currency: 'IDR', display: 'IDR 64,000' }, usd: { amount: 4, currency: 'USD', display: '$4' } },
    'social-50': { credits: 50, idr: { amount: 192000, currency: 'IDR', display: 'IDR 192,000' }, usd: { amount: 12, currency: 'USD', display: '$12' } },
  },
}

export default function Pricing() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [snapReady, setSnapReady] = useState(false)
  const [currency, setCurrency] = useState<Currency>('IDR')
  const [pricing, setPricing] = useState<PricingData>(FALLBACK_PRICING)
  const resumedRef = useRef(false)

  useEffect(() => {
    document.title = 'Pricing | Vanaila Studio Pro'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Upgrade Vanaila Studio for unlimited daily use, premium templates, bulk exports, and Pro browser tools.')

    const token = getAuthToken()
    if (token) {
      getMe(token).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    getPricing().then(setPricing).catch(() => {})
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

  async function handleSubscribe(tier: Tier) {
    const token = getAuthToken()
    if (!token) {
      localStorage.setItem('vs_post_auth_redirect', `/pricing?tier=${tier}`)
      navigate('/login')
      return
    }

    setProcessingId(tier)
    try {
      const { snap_token } = await createCheckout(tier)
      if (!window.snap) {
        alert('Payment system is loading. Please wait a moment and try again.')
        return
      }
      window.snap.pay(snap_token, {
        onSuccess: () => navigate('/app/account'),
        onPending: () => navigate('/app/account'),
        onError: () => navigate('/pricing'),
        onClose: () => {},
      })
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  async function handlePack(packId: PackId) {
    const token = getAuthToken()
    if (!token) {
      localStorage.setItem('vs_post_auth_redirect', `/pricing?pack=${packId}`)
      navigate('/login')
      return
    }

    setProcessingId(packId)
    try {
      const { snap_token } = await createPackCheckout(packId)
      if (!window.snap) {
        alert('Payment system is loading. Please wait a moment and try again.')
        return
      }
      window.snap.pay(snap_token, {
        onSuccess: () => navigate('/app/account'),
        onPending: () => navigate('/app/account'),
        onError: () => navigate('/pricing'),
        onClose: () => {},
      })
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  // Resume a purchase that was interrupted by a login redirect.
  useEffect(() => {
    if (resumedRef.current || loading || !snapReady) return
    const token = getAuthToken()
    if (!token) return

    const tierParam = searchParams.get('tier') as Tier | null
    const packParam = searchParams.get('pack') as PackId | null

    if (tierParam && PLANS.some((p) => p.id === tierParam)) {
      resumedRef.current = true
      handleSubscribe(tierParam)
    } else if (packParam && PACKS.some((p) => p.id === packParam)) {
      resumedRef.current = true
      handlePack(packParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, snapReady, searchParams])

  return (
    <main className="pricing-page">
      <MarketingNav />

      <section className="pricing-hero">
        <div className="pricing-hero__badge"><SparkIcon /> Free plan available</div>
        <h1>Pay for output, <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 400 }}>not access.</span></h1>
        <p>
          Free tools stay useful. Paid plans unlock higher daily limits, premium templates, and bulk export
          for people who produce finished files every week.
        </p>
        <div className="pricing-currency" role="group" aria-label="Currency">
          <button
            type="button"
            className={`pricing-currency__btn${currency === 'IDR' ? ' is-active' : ''}`}
            aria-pressed={currency === 'IDR'}
            onClick={() => setCurrency('IDR')}
          >
            IDR
          </button>
          <button
            type="button"
            className={`pricing-currency__btn${currency === 'USD' ? ' is-active' : ''}`}
            aria-pressed={currency === 'USD'}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
        </div>
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

      <section className="pricing-grid" aria-label="Paid plans">
        {PLANS.map((plan) => {
          const price = currency === 'IDR' ? pricing.pro[plan.id].idr : pricing.pro[plan.id].usd
          return (
            <article key={plan.id} className={`price-card price-card--${plan.kind}`}>
              {plan.badge && <div className="price-card__badge">{plan.badge}</div>}
              <div className="price-card__eyebrow">{plan.eyebrow}</div>
              <h2>{plan.title}</h2>
              <div className="price-card__price">
                <span>{price.display}</span>
                <small>{plan.unit}</small>
              </div>
              <div className="price-card__note">
                {plan.note}
                {currency === 'USD' && <span> · billed as {pricing.pro[plan.id].idr.display} via Midtrans</span>}
              </div>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><CheckIcon /> {feature}</li>
                ))}
              </ul>
              <button className="price-card__cta" onClick={() => handleSubscribe(plan.id)} disabled={loading || processingId === plan.id || !snapReady}>
                {processingId === plan.id ? 'Opening checkout…' : plan.cta} <ArrowIcon />
              </button>
            </article>
          )
        })}
      </section>

      <section className="pricing-packs" aria-label="Credit packs">
        <div className="pricing-packs__head">
          <span>One-time credit packs</span>
          <h2>Need a burst of exports for one project?</h2>
          <p>Credits stack on top of your daily limit, never expire, and remove the watermark for that export.</p>
        </div>
        <div className="pricing-packs__grid">
          {PACKS.map((pack) => {
            const packData = pricing.packs[pack.id]
            const price = currency === 'IDR' ? packData.idr : packData.usd
            return (
              <article key={pack.id} className="pack-card">
                <h3>{pack.title}</h3>
                <div className="pack-card__price">
                  <span>{price.display}</span>
                  {currency === 'USD' && <small>billed as {packData.idr.display}</small>}
                </div>
                <p>{pack.description}</p>
                <button className="pack-card__cta" onClick={() => handlePack(pack.id)} disabled={loading || processingId === pack.id || !snapReady}>
                  {processingId === pack.id ? 'Opening checkout…' : `Buy ${packData.credits} credits`} <ArrowIcon />
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="pricing-guidance">
        <div>
          <span>Recommended model</span>
          <h2>Pick the tier that matches your weekly volume.</h2>
        </div>
        <div className="pricing-guidance__cards">
          <div><strong>Free plan</strong><p>Good for testing, light work, and occasional use with daily limits.</p></div>
          <div><strong>Starter → Business</strong><p>Same features, higher daily limits as you scale up production.</p></div>
          <div><strong>Cancel anytime</strong><p>Subscription access stays active through the paid period after cancellation.</p></div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  )
}
