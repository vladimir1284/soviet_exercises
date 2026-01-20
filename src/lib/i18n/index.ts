import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator, locale } from 'svelte-i18n';

const defaultLocale = 'es';

register('es', () => import('./es.json'));
register('en', () => import('./en.json'));

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? getLocaleFromNavigator() : defaultLocale,
});

export { locale };
export const locales = ['es', 'en'] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
};
