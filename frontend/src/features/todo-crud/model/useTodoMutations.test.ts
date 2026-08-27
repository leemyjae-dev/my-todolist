import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { apiFetch } from '../../../shared/api/apiClient';
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from './useTodoMutations';
import type { Todo } from '../../../entities/todo/model/todo.types';

vi.mock('../../../shared/api/apiClient', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const sampleTodo: Todo = {
  id: '1',
  categoryId: 'c1',
  title: '제목',
  description: null,
  startDate: '2026-08-27',
  endDate: '2026-08-28',
  isCompleted: false,
  completedAt: null,
  status: 'NOT_STARTED',
  createdAt: 't',
  updatedAt: 't',
};

describe('useTodoMutations', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it('useCreateTodo: 성공 시 생성된 Todo를 반환한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => sampleTodo,
    } as Response);

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    const created = await result.current.mutateAsync({
      title: '제목',
      description: undefined,
      startDate: '2026-08-27',
      endDate: '2026-08-28',
    });

    expect(created).toEqual(sampleTodo);
  });

  it('useCreateTodo: 실패 시 에러 메시지와 함께 reject한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: 'VALIDATION_ERROR', message: '제목은 필수입니다.' } }),
    } as Response);

    const { result } = renderHook(() => useCreateTodo(), { wrapper: createWrapper() });

    await expect(
      result.current.mutateAsync({
        title: '',
        description: undefined,
        startDate: '2026-08-27',
        endDate: '2026-08-28',
      })
    ).rejects.toThrow('제목은 필수입니다.');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('useUpdateTodo: 성공 시 PATCH 메서드로 호출하고 수정된 Todo를 반환한다', async () => {
    const updated = { ...sampleTodo, title: '수정된 제목' };
    mockedApiFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => updated,
    } as Response);

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: createWrapper() });

    const response = await result.current.mutateAsync({
      id: '1',
      input: { title: '수정된 제목' },
    });

    expect(response).toEqual(updated);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('1'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('useDeleteTodo: 성공 시 DELETE 메서드로 호출한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => undefined,
    } as Response);

    const { result } = renderHook(() => useDeleteTodo(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync('1')).resolves.toBeUndefined();
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('useDeleteTodo: 실패 시 에러 메시지와 함께 reject한다', async () => {
    mockedApiFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: '할일을 찾을 수 없습니다.' } }),
    } as Response);

    const { result } = renderHook(() => useDeleteTodo(), { wrapper: createWrapper() });

    await expect(result.current.mutateAsync('1')).rejects.toThrow('할일을 찾을 수 없습니다.');
  });
});
