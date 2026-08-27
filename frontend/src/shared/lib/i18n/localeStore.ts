import { create } from 'zustand';
import { applyLocale, getInitialLocale, type Locale } from '../locale';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: getInitialLocale(),
  setLocale: (locale) => {
    applyLocale(locale);
    set({ locale });
  },
}));
