import { ko } from './locales/ko';
import { en } from './locales/en';
import { ja } from './locales/ja';
import type { Locale } from '../locale';

export type Dictionary = typeof ko;

const dictionaries: Record<Locale, Dictionary> = { ko, en, ja };

function flatten(obj: object, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out[path] = value;
    } else if (value && typeof value === 'object') {
      Object.assign(out, flatten(value, path));
    }
  }
  return out;
}

const flatDictionaries: Record<Locale, Record<string, string>> = {
  ko: flatten(dictionaries.ko),
  en: flatten(dictionaries.en),
  ja: flatten(dictionaries.ja),
};

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const dict = flatDictionaries[locale] ?? flatDictionaries.ko;
  let text = dict[key] ?? flatDictionaries.ko[key] ?? key;
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replaceAll(`{{${paramKey}}}`, String(value));
    }
  }
  return text;
}
