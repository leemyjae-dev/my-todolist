import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api/apiClient';
import { parseErrorOrThrow } from '../../../shared/api/parseErrorOrThrow';
import type { User } from '../../auth/api/authApi';

interface UpdateMeInput {
  name?: string;
  password?: string;
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
