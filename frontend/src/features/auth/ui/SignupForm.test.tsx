import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { signup } from '../api/authApi';
import SignupForm from './SignupForm';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api/authApi', () => ({ signup: vi.fn() }));

const mockedSignup = vi.mocked(signup);

function renderForm() {
  const view = render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  );
  // 라벨 기반 접근 우선, 실패 시 아래 fallback을 사용할 수 있다:
  //   view.container.querySelectorAll('input') 순서 기반 접근
  //   screen.getByRole('textbox', { name: /.../ })
  return view;
}

function getFields() {
  const email = screen.getByLabelText(/이메일/);
  const password = screen.getByLabelText(/비밀번호/);
  const name = screen.getByLabelText(/이름/);
  return { email, password, name };
}

describe('SignupForm', () => {
  beforeEach(() => {
    mockedSignup.mockReset();
    mockNavigate.mockReset();
  });

  it('아무것도 입력하지 않고 제출하면 signup API가 호출되지 않는다', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(mockedSignup).not.toHaveBeenCalled();
  });

  it('유효한 값 입력 후 제출하면 성공 시 /login으로 이동한다', async () => {
    mockedSignup.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      name: '홍길동',
      createdAt: 't',
      updatedAt: 't',
    });
    renderForm();
    const { email, password, name } = getFields();

    fireEvent.change(email, { target: { value: 'a@b.com' } });
    fireEvent.change(password, { target: { value: 'password1' } });
    fireEvent.change(name, { target: { value: '홍길동' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('signup이 실패하면 에러 메시지를 화면에 표시한다', async () => {
    mockedSignup.mockRejectedValue(new Error('이미 사용 중인 이메일입니다.'));
    renderForm();
    const { email, password, name } = getFields();

    fireEvent.change(email, { target: { value: 'a@b.com' } });
    fireEvent.change(password, { target: { value: 'password1' } });
    fireEvent.change(name, { target: { value: '홍길동' } });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
  });
});
