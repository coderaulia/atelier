import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '../locales/en/common.json'
import enTools from '../locales/en/tools.json'
import enLegal from '../locales/en/legal.json'
import idCommon from '../locales/id/common.json'
import idTools from '../locales/id/tools.json'
import idLegal from '../locales/id/legal.json'

export const supportedLanguages = ['en', 'id'] as const
export type SupportedLanguage = typeof supportedLanguages[number]

const STORAGE_KEY = 'atelier.language'

function detectLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'id') return stored

  const browserLang = window.navigator.language.toLowerCase().split('-')[0]
  return browserLang === 'id' ? 'id' : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, tools: enTools, legal: enLegal },
    id: { common: idCommon, tools: idTools, legal: idLegal },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  supportedLngs: supportedLanguages,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined' && (lng === 'en' || lng === 'id')) {
    window.localStorage.setItem(STORAGE_KEY, lng)
    document.documentElement.lang = lng
  }
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language === 'id' ? 'id' : 'en'
}

export default i18n
