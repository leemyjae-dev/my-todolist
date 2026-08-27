import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuthStore } from '../model/authStore';
import LoginForm from './LoginForm';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/authApi', () => ({ login: vi.fn() }));
vi.mock('../model/authStore', () => ({ useAuthStore: { getState: vi.fn() } }));

const mockedLogin = vi.mocked(login);
const mockedUseAuthStore = vi.mocked(useAuthStore);

function renderForm(initialEntries: Array<string | { pathname: string; state?: unknown }> = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LoginForm />
    </MemoryRouter>
  );
}

function getFields() {
  const email = screen.getByLabelText(/이메일/);
  const password = screen.getByLabelText(/비밀번호/);
  return { email, password };
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    mockNavigate.mockReset();
    mockedUseAuthStore.getState.mockReturnValue({ login: vi.fn() } as never);
  });

  it('location.state에 from이 있으면 로그인 성공 시 해당 경로로 이동한다', async () => {
    mockedLogin.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' },
    });
    renderForm([{ pathname: '/login', state: { from: { pathname: '/categories' } } }]);
    const { email, password } = getFields();

    fireEvent.change(email, { target: { value: 'a@b.com' } });
    fireEvent.change(password, { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await vi.waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/categories', { replace: true })
    );
  });

  it('location.state가 없으면 로그인 성공 시 /todos로 이동한다', async () => {
    mockedLogin.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' },
    });
    renderForm();
    const { email, password } = getFields();

    fireEvent.change(email, { target: { value: 'a@b.com' } });
    fireEvent.change(password, { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/todos', { replace: true }));
  });
});
