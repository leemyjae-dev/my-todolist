import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCategories } from './useCategories';
import { fetchCategories } from '../api/categoryApi';
import type { Category } from './category.types';

vi.mock('../api/categoryApi', () => ({ fetchCategories: vi.fn() }));

const mockedFetchCategories = vi.mocked(fetchCategories);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCategories', () => {
  beforeEach(() => {
    mockedFetchCategories.mockReset();
  });

  it('데이터를 정상 반환한다', async () => {
    const categories: Category[] = [{ id: '1', name: '기본', isDefault: true }];
    mockedFetchCategories.mockResolvedValue(categories);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(categories);
  });
});
