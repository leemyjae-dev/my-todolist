import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useUpdateMe } from '../model/useUpdateMe';
import ProfileForm from './ProfileForm';
import type { User } from '../../auth/api/authApi';

vi.mock('../model/useUpdateMe', () => ({ useUpdateMe: vi.fn() }));

const mockedUseUpdateMe = vi.mocked(useUpdateMe);

const sampleUser: User = { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' };

function renderForm(onSaved = vi.fn()) {
  render(
    <MemoryRouter>
      <ProfileForm user={sampleUser} onSaved={onSaved} />
    </MemoryRouter>
  );
  return { onSaved };
}

describe('ProfileForm', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn();
    mockedUseUpdateMe.mockReturnValue({ mutateAsync, isPending: false } as never);
  });

  it('이메일 input은 값이 고정되어 변경할 수 없다', () => {
    renderForm();

    const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
    expect(emailInput.value).toBe(sampleUser.email);
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveAttribute('readonly');

    fireEvent.change(emailInput, { target: { value: 'changed@b.com' } });
    expect(emailInput.value).toBe(sampleUser.email);
  });

  it('비밀번호 7자 입력 후 저장 시 에러가 표시되고 mutateAsync/onSaved가 호출되지 않는다', async () => {
    const { onSaved } = renderForm();

    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: '1234567' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });

    expect(screen.getByText('비밀번호는 8자 이상이어야 합니다.')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('비밀번호 빈 값으로 이름만 바꿔 저장하면 password 없이 mutateAsync가 호출되고 onSaved가 호출된다', async () => {
    mutateAsync.mockResolvedValue(sampleUser);
    const { onSaved } = renderForm();

    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '새이름' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });

    expect(mutateAsync).toHaveBeenCalledWith({ name: '새이름' });
    expect(onSaved).toHaveBeenCalled();
  });

  it('비밀번호 8자 이상 입력 후 저장하면 name과 password가 함께 mutateAsync에 전달된다', async () => {
    mutateAsync.mockResolvedValue(sampleUser);
    renderForm();

    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'password1' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });

    expect(mutateAsync).toHaveBeenCalledWith({ name: sampleUser.name, password: 'password1' });
  });

  it('mutateAsync가 실패하면 에러 메시지가 표시되고 onSaved가 호출되지 않는다', async () => {
    mutateAsync.mockRejectedValue(new Error('이미 사용 중인 이름입니다.'));
    const { onSaved } = renderForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '저장' }));
    });

    expect(screen.getByText('이미 사용 중인 이름입니다.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
