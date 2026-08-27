import { apiFetch } from '../../../shared/api/apiClient';
import { translate } from '../../../shared/lib/i18n/translate';
import { useLocaleStore } from '../../../shared/lib/i18n/localeStore';
import type { User } from '../../../features/auth/api/authApi';

export async function fetchMe(): Promise<User> {
  if (import.meta.env.DEV) console.log('[userApi] fetchMe');
  const res = await apiFetch('/users/me');
  if (!res.ok) throw new Error(translate(useLocaleStore.getState().locale, 'profile.loadFailed'));
  return res.json();
}
