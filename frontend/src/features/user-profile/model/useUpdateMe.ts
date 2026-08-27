import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/apiClient';
import type { User } from '../../auth/api/authApi';

interface UpdateMeInput {
  name?: string;
  password?: string;
}

async function parseErrorOrThrow(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error(body?.error?.message ?? '요청 처리 중 오류가 발생했습니다.');
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateMeInput): Promise<User> => {
      const res = await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify(input) });
      if (!res.ok) return parseErrorOrThrow(res);
      return res.json();
    },
    onSuccess: () => {
      if (import.meta.env.DEV) console.log('[user] update ok');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      if (import.meta.env.DEV) console.log('[user] update fail', err);
    },
  });
}
