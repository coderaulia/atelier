import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../lib/auth'
import { getMe } from '../lib/api'
import './Pricing.css'

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
    id: 'cv-10',
    eyebrow: 'CV Pack',
    title: '10 polished CV exports',
    price: '$4',
    unit: 'one-time',
    note: 'Best for job seekers',
    description: 'Enough for tailoring CVs to multiple job applications without paying monthly.',
    badge: 'No subscription',
    kind: 'warm',
    cta: 'Buy 10 CV exports',
    features: ['10 watermark-free CV exports', 'Premium CV templates', 'ATS layout checks', 'Unused credits stay in account'],
  },
  {
    id: 'social-30',
    eyebrow: 'Creator Pack',
    title: '30 social media exports',
    price: '$12',
    unit: 'one-time',
    note: 'Most practical pack',
    description: 'A monthly content sprint without a subscription. Perfect for launches, promos, and campaigns.',
    badge: 'Popular',
    kind: 'premium',
    cta: 'Buy 30 social exports',
    features: ['30 watermark-free social exports', 'Brand kit for this pack', 'Batch export up to 10 designs', 'Square, story, and carousel formats'],
  },
  {
    id: 'social-45',
    eyebrow: 'Growth Pack',
    title: '45 social + document exports',
    price: '$16',
    unit: 'one-time',
    note: 'Best value pack',
    description: 'For creators and small businesses that need social posts plus PDFs in one purchase.',
    badge: 'Save 25%',
    kind: 'dark',
    cta: 'Buy 45 mixed credits',
    features: ['45 mixed export credits', 'Use for CV, PDF, or social', 'No watermark', 'Priority export queue'],
  },
  {
    id: 'all-access',
    eyebrow: 'Power User',
    title: 'Unlimited workspace',
    price: '$8',
    unit: 'per month',
    note: 'Only if you use everything',
    description: 'For freelancers who generate documents, content, OCR, and conversions every week.',
    badge: 'Unlimited',
    kind: 'soft',
    cta: 'Subscribe monthly',
    features: ['Unlimited exports', 'Cloud document history', 'AI drafting across tools', 'Cancel anytime'],
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserLite | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Pricing — Atelier by Vanaila'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Buy CV and social media export packs. No subscription needed. Subscribe only for unlimited use.')

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

  async function handlePurchase(packId: string) {
    const token = getAuthToken()
    if (!token) {
      localStorage.setItem('vs_post_auth_redirect', `/pricing?pack=${packId}`)
      navigate('/login')
      return
    }

    setProcessingPayment(packId)
    try {
      alert('Payment checkout coming next. Selected pack: ' + packId)
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
        <div className="pricing-hero__badge"><SparkIcon /> No subscription needed</div>
        <h1>Pay for output, not access.</h1>
        <p>
          Free tools stay useful. Paid packs remove watermarks and unlock higher-value exports.
          Buy CV or social credits when you need them — subscribe only if you produce every week.
        </p>
      </section>

      <section className="pricing-free-strip" aria-label="Free plan limits">
        <div>
          <span>Free forever</span>
          <strong>Good for testing, light work, and occasional use.</strong>
        </div>
        <ul>
          <li>Daily export limits</li>
          <li>Watermarked output</li>
          <li>Local-only storage</li>
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
            <button className="price-card__cta" onClick={() => handlePurchase(pack.id)} disabled={loading || processingPayment === pack.id}>
              {processingPayment === pack.id ? 'Opening checkout…' : pack.cta} <ArrowIcon />
            </button>
          </article>
        ))}
      </section>

      <section className="pricing-guidance">
        <div>
          <span>Recommended model</span>
          <h2>Use credits as revenue engine.</h2>
        </div>
        <div className="pricing-guidance__cards">
          <div><strong>$4 CV pack</strong><p>Low friction. Converts job seekers who only need outcome, not account commitment.</p></div>
          <div><strong>$12 social pack</strong><p>Higher perceived value. Clear campaign-sized bundle for creators and small businesses.</p></div>
          <div><strong>$8/mo unlimited</strong><p>Keep subscription for power users only. It becomes convenience, not forced commitment.</p></div>
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
