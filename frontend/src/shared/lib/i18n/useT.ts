import { useCallback } from 'react';
import { useLocaleStore } from './localeStore';
import { translate } from './translate';

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );
}
