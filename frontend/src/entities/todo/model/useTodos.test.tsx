import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTodos } from './useTodos';
import { fetchTodos } from '../api/todoApi';
import type { TodoListResponse } from './todo.types';

vi.mock('../api/todoApi', () => ({ fetchTodos: vi.fn() }));

const mockedFetchTodos = vi.mocked(fetchTodos);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTodos', () => {
  beforeEach(() => {
    mockedFetchTodos.mockReset();
  });

  it('데이터를 정상 반환한다', async () => {
    const response: TodoListResponse = { items: [], page: 1, limit: 20, total: 0 };
    mockedFetchTodos.mockResolvedValue(response);

    const { result } = renderHook(() => useTodos({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(response);
  });
});
