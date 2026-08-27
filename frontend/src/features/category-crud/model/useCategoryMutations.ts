import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/apiClient';
import type { Category } from '../../../entities/category/model/category.types';

async function parseErrorOrThrow(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error(body?.error?.message ?? '요청 처리 중 오류가 발생했습니다.');
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name }: { name: string }): Promise<Category> => {
      const res = await apiFetch('/categories', { method: 'POST', body: JSON.stringify({ name }) });
      if (!res.ok) return parseErrorOrThrow(res);
      return res.json();
    },
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('[category] create ok');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      if (import.meta.env.DEV) console.log('[category] create fail', err);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) return parseErrorOrThrow(res);
    },
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('[category] delete ok');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (err) => {
      if (import.meta.env.DEV) console.log('[category] delete fail', err);
    },
  });
}
