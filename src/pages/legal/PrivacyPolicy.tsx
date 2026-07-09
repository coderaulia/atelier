import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  const { t } = useTranslation('legal')
  const s = t('privacy.sections', { returnObjects: true }) as Record<string, { title: string; items?: string[]; body?: string; intro?: string }>

  useEffect(() => {
    document.title = `${t('privacy.title')} — Vanaila Studio`
  }, [])

  return (
    <main style={{ maxWidth: 740, margin: '0 auto', padding: '60px 24px 100px' }}>
      <Link to="/" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24, display: 'inline-block' }}>← Back to Vanaila Studio</Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 8 }}>{t('privacy.title')}</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32 }}>{t('privacy.lastUpdated')}</p>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)', marginBottom: 40 }}>{t('privacy.intro')}</p>

      {Object.entries(s).map(([key, section]) => (
        <section key={key} style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>{section.title}</h2>
          {section.intro && <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 10 }}>{section.intro}</p>}
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
  )
}
