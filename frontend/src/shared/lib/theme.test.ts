import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyTheme, getInitialTheme } from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('저장된 테마가 없고 시스템이 라이트 선호면 light를 반환한다', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }) as MediaQueryList);
    expect(getInitialTheme()).toBe('light');
    vi.unstubAllGlobals();
  });

  it('저장된 테마가 없고 시스템이 다크 선호면 dark를 반환한다', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: true, media: query }) as MediaQueryList);
    expect(getInitialTheme()).toBe('dark');
    vi.unstubAllGlobals();
  });

  it('localStorage에 저장된 테마가 있으면 그 값을 우선한다', () => {
    localStorage.setItem('mtl_theme', 'dark');
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }) as MediaQueryList);
    expect(getInitialTheme()).toBe('dark');
    vi.unstubAllGlobals();
  });

  it('applyTheme은 documentElement의 data-theme 속성과 localStorage를 갱신한다', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('mtl_theme')).toBe('dark');
  });
});
