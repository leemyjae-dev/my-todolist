import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { useThemeStore } from '../../features/theme/model/themeStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }) as MediaQueryList);
    useThemeStore.setState({ theme: 'light' });
  });

  it('클릭하면 테마가 전환된다', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: '다크 모드로 전환' });
    fireEvent.click(button);

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
