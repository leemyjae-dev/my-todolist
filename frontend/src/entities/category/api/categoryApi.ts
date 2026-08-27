import { apiFetch } from '../../../shared/api/apiClient';
import { translate } from '../../../shared/lib/i18n/translate';
import { useLocaleStore } from '../../../shared/lib/i18n/localeStore';
import type { Category } from '../model/category.types';

export async function fetchCategories(): Promise<Category[]> {
  if (import.meta.env.DEV) console.log('[categoryApi] fetchCategories');
  const res = await apiFetch('/categories');
  if (!res.ok) throw new Error(translate(useLocaleStore.getState().locale, 'category.errors.loadFailed'));
  return res.json();
}
