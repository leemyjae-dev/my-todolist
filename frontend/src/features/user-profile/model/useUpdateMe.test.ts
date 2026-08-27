import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { apiFetch } from '../../../shared/api/apiClient';
import { useUpdateMe } from './useUpdateMe';
import type { User } from '../../auth/api/authApi';

vi.mock('../../../shared/api/apiClient', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const sampleUser: User = { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' };

describe('useUpdateMe', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it('성공 시 PATCH 메서드로 호출하고 수정된 User를 반환한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => sampleUser,
    } as Response);

    const { result } = renderHook(() => useUpdateMe(), { wrapper: createWrapper() });

    const updated = await result.current.mutateAsync({ name: '홍길동' });

    expect(updated).toEqual(sampleUser);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('실패 시 에러 메시지와 함께 reject한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: '비밀번호는 8자 이상이어야 합니다.' } }),
    } as Response);

    const { result } = renderHook(() => useUpdateMe(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync({ password: 'short' })).rejects.toThrow(
      '비밀번호는 8자 이상이어야 합니다.'
    );
  });
});
