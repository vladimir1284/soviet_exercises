import { browser } from '$app/environment'
import { init, register, locale, waitLocale } from 'svelte-i18n'

const defaultLocale = 'es'

// Register locales
register('es', () => import('./es.json'))
register('en', () => import('./en.json'))

// Get initial locale
function getInitialLocale(): string {
  if (!browser) return defaultLocale

  // Check localStorage first
  const stored = localStorage.getItem('locale')
  if (stored && ['es', 'en'].includes(stored)) {
    return stored
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  if (['es', 'en'].includes(browserLang)) {
    return browserLang
  }

  return defaultLocale
}

// Initialize i18n
init({
  fallbackLocale: defaultLocale,
  initialLocale: getInitialLocale(),
})

export { locale, waitLocale }
export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}
