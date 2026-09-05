import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import MarketingNav from '@/components/navigation/MarketingNav'
import MarketingFooter from '@/components/navigation/MarketingFooter'
import { Link } from 'react-router-dom'

export default function TermsOfService() {
  const { t } = useTranslation('legal')
  const s = t('terms.sections', { returnObjects: true }) as Record<string, { title: string; items?: string[]; body?: string }>

  useEffect(() => {
    document.title = `${t('terms.title')} — Vanaila Studio`
  }, [])

  return (
    <div className="public-page">
      <MarketingNav />
      <main className="public-page__content">
      <Link to="/" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24, display: 'inline-block' }}>← Back to Vanaila Studio</Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 8 }}>{t('terms.title')}</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32 }}>{t('terms.lastUpdated')}</p>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)', marginBottom: 40 }}>{t('terms.intro')}</p>

      {Object.entries(s).map(([key, section]) => (
        <section key={key} style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>{section.title}</h2>
          {section.items && (
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.items.map((item, i) => (
                <li key={i} style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>{item}</li>
              ))}
            </ul>
          )}
          {section.body && <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>{section.body}</p>}
        </section>
      ))}
      </main>
      <MarketingFooter />
    </div>
  )
}
