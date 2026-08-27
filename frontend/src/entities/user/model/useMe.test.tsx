import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMe } from './useMe';
import { fetchMe } from '../api/userApi';
import type { User } from '../../../features/auth/api/authApi';

vi.mock('../api/userApi', () => ({ fetchMe: vi.fn() }));

const mockedFetchMe = vi.mocked(fetchMe);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useMe', () => {
  beforeEach(() => {
    mockedFetchMe.mockReset();
  });

  it('데이터를 정상 반환한다', async () => {
    const user: User = { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' };
    mockedFetchMe.mockResolvedValue(user);

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(user);
  });
});
