import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import MarketingNav from '@/components/navigation/MarketingNav'
import MarketingFooter from '@/components/navigation/MarketingFooter'
import { Link } from 'react-router-dom'

interface ContactChannel {
  label: string
  value: string
  href: string
}

export default function Contact() {
  const { t } = useTranslation('legal')
  const channels = t('contact.channels.items', { returnObjects: true }) as ContactChannel[]

  useEffect(() => {
    document.title = `${t('contact.title')} — Vanaila Studio`
  }, [])

  return (
    <div className="public-page">
      <MarketingNav />
      <main className="public-page__content">
      <Link to="/" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24, display: 'inline-block' }}>← Back to Vanaila Studio</Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 8 }}>{t('contact.title')}</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32 }}>{t('contact.lastUpdated')}</p>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)', marginBottom: 40 }}>{t('contact.intro')}</p>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>{t('contact.channels.title')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channels.map((ch, i) => (
            <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>{ch.label}</div>
              {ch.href ? (
                <a href={ch.href} style={{ fontSize: 15, color: 'var(--accent)', textDecoration: 'none' }}>{ch.value}</a>
              ) : (
                <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>{ch.value}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>{t('contact.responseTime.title')}</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>{t('contact.responseTime.body')}</p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>{t('contact.office.title')}</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>{t('contact.office.body')}</p>
      </section>
      </main>
      <MarketingFooter />
    </div>
  )
}
