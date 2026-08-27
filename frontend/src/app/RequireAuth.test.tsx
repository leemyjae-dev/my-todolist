import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../features/auth/model/authStore';
import RequireAuth from './RequireAuth';

vi.mock('../features/auth/model/authStore', () => ({ useAuthStore: vi.fn() }));

const mockedUseAuthStore = vi.mocked(useAuthStore);

function renderWithAuth(isAuthenticated: boolean) {
  mockedUseAuthStore.mockImplementation((selector) => selector({ isAuthenticated } as never));

  return render(
    <MemoryRouter initialEntries={['/todos']}>
      <Routes>
        <Route path="/login" element={<div>로그인 페이지</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/todos" element={<div>보호된 콘텐츠</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  it('인증되지 않은 경우 로그인 페이지로 리다이렉트한다', () => {
    renderWithAuth(false);

    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증된 경우 보호된 콘텐츠를 렌더링한다', () => {
    renderWithAuth(true);

    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
  });
});
