import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { apiFetch } from '../../../shared/api/apiClient';
import { useCreateCategory, useDeleteCategory } from './useCategoryMutations';
import type { Category } from '../../../entities/category/model/category.types';

vi.mock('../../../shared/api/apiClient', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const sampleCategory: Category = { id: 'c1', name: '업무', isDefault: false };

describe('useCategoryMutations', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it('useCreateCategory: 성공 시 생성된 Category를 반환하고 POST로 호출한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => sampleCategory,
    } as Response);

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });

    const created = await result.current.mutateAsync({ name: '업무' });

    expect(created).toEqual(sampleCategory);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/categories'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('useCreateCategory: 실패(409) 시 에러 메시지와 함께 reject한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: { code: 'CATEGORY_NAME_TAKEN', message: '이미 사용 중인 카테고리 이름입니다.' },
      }),
    } as Response);

    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync({ name: '업무' })).rejects.toThrow(
      '이미 사용 중인 카테고리 이름입니다.'
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('useDeleteCategory: 성공 시 DELETE 메서드로 해당 id를 호출한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => undefined,
    } as Response);

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync('c1')).resolves.toBeUndefined();
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('c1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('useDeleteCategory: 실패 시 에러 메시지와 함께 reject한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: '카테고리를 찾을 수 없습니다.' } }),
    } as Response);

    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync('c1')).rejects.toThrow('카테고리를 찾을 수 없습니다.');
  });
});
