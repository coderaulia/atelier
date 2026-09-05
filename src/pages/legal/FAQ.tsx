import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import MarketingNav from '@/components/navigation/MarketingNav'
import MarketingFooter from '@/components/navigation/MarketingFooter'
import { Link } from 'react-router-dom'

interface FAQItem {
  q: string
  a: string
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

export default function FAQ() {
  const { t } = useTranslation('legal')
  const categories = t('faq.categories', { returnObjects: true }) as FAQCategory[]
  const [openKey, setOpenKey] = useState<string | null>(null)

  useEffect(() => {
    document.title = `${t('faq.title')} — Vanaila Studio`
  }, [])

  return (
    <div className="public-page">
      <MarketingNav />
      <main className="public-page__content">
      <Link to="/" style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24, display: 'inline-block' }}>← Back to Vanaila Studio</Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 8 }}>{t('faq.title')}</h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 32 }}>{t('faq.lastUpdated')}</p>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)', marginBottom: 40 }}>
        {t('faq.intro')}{' '}
        <Link to="/contact" style={{ color: 'var(--accent)' }}>{t('contact.title')}</Link>
      </p>

      {categories.map((cat, ci) => (
        <section key={ci} style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>{cat.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cat.items.map((item, ii) => {
              const key = `${ci}-${ii}`
              const isOpen = openKey === key
              return (
                <div key={key} style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--ink-1)',
                    }}
                  >
                    <span>{item.q}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink-3)', flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
      </main>
      <MarketingFooter />
    </div>
  )
}
