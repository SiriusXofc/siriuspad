import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/i18n/locales/en.json'
import es from '@/i18n/locales/es.json'
import ptBR from '@/i18n/locales/pt-BR.json'

function normalizeInitialLanguage(language?: string | null) {
  const normalized = (language ?? '').trim().toLowerCase()

  if (normalized.startsWith('pt')) {
    return 'pt-BR'
  }

  if (normalized.startsWith('es')) {
    return 'es'
  }

  return 'en'
}

function detectInitialLanguage() {
  if (typeof navigator !== 'undefined') {
    return normalizeInitialLanguage(
      navigator.languages?.[0] ?? navigator.language ?? null,
    )
  }

  return 'pt-BR'
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
    es: { translation: es },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
