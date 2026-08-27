import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/apiClient';
import type { Todo } from '../../../entities/todo/model/todo.types';

interface TodoInput {
  title: string;
  description?: string;
  categoryId?: string;
  startDate: string;
  endDate: string;
  isCompleted?: boolean;
}

async function parseErrorOrThrow(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const message = body?.error?.message ?? '요청 처리 중 오류가 발생했습니다.';
  throw new Error(message);
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TodoInput): Promise<Todo> => {
      const res = await apiFetch('/todos', { method: 'POST', body: JSON.stringify(input) });
      if (!res.ok) return parseErrorOrThrow(res);
      return res.json();
    },
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('[todo] create ok');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (err) => {
      if (import.meta.env.DEV) console.log('[todo] create fail', err);
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await apiFetch(`/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) return parseErrorOrThrow(res);
    },
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('[todo] delete ok');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (err) => {
      if (import.meta.env.DEV) console.log('[todo] delete fail', err);
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<TodoInput> }): Promise<Todo> => {
      const res = await apiFetch(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
      if (!res.ok) return parseErrorOrThrow(res);
      return res.json();
    },
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('[todo] update ok');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (err) => {
      if (import.meta.env.DEV) console.log('[todo] update fail', err);
    },
  });
}
