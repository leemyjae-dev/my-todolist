export type Locale = 'ko' | 'en' | 'ja';

const STORAGE_KEY = 'mtl_locale';

export function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ko' || stored === 'en' || stored === 'ja') return stored;
  const lang = navigator.language.slice(0, 2);
  if (lang === 'ko' || lang === 'ja') return lang;
  return 'en';
}

export function applyLocale(locale: Locale): void {
  document.documentElement.setAttribute('lang', locale);
  localStorage.setItem(STORAGE_KEY, locale);
  if (import.meta.env.DEV) console.log('[locale] applied', locale);
}
