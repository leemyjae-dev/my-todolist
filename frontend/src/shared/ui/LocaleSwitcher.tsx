import type { ChangeEvent } from 'react';
import { useLocaleStore } from '../lib/i18n/localeStore';
import type { Locale } from '../lib/locale';
import { useT } from '../lib/i18n/useT';
import './locale-switcher.css';

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
];

export default function LocaleSwitcher() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    setLocale(e.target.value as Locale);
  }

  return (
    <select className="locale-switcher" aria-label={t('locale.label')} value={locale} onChange={handleChange}>
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
