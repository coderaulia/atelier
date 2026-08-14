import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '../lib/i18n'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = (i18n.language || 'en').split('-')[0] as SupportedLanguage

  const toggle = (lng: SupportedLanguage) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {(['en', 'id'] as const).map((lng, i) => (
        <button
          key={lng}
          onClick={() => toggle(lng)}
          style={{
            padding: '5px 10px',
            border: 'none',
            borderRadius: i === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
            background: current === lng ? 'var(--ink)' : 'var(--border)',
            color: current === lng ? 'var(--bg)' : 'var(--ink-3)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
