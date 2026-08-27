import { translate } from '../../../shared/lib/i18n/translate';
import { useLocaleStore } from '../../../shared/lib/i18n/localeStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const locale = useLocaleStore.getState().locale;
  if (!email) return translate(locale, 'auth.validation.emailRequired');
  if (!EMAIL_RE.test(email)) return translate(locale, 'auth.validation.emailInvalid');
  return null;
}

export function validatePassword(password: string): string | null {
  const locale = useLocaleStore.getState().locale;
  if (!password) return translate(locale, 'auth.validation.passwordRequired');
  if (password.length < 8) return translate(locale, 'auth.validation.passwordTooShort');
  return null;
}

export function validateName(name: string): string | null {
  const locale = useLocaleStore.getState().locale;
  if (!name || name.length < 1 || name.length > 50) return translate(locale, 'auth.validation.nameInvalid');
  return null;
}
