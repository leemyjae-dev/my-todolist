import { apiFetch } from '../../../shared/api/apiClient';
import type { User } from '../../../features/auth/api/authApi';

export async function fetchMe(): Promise<User> {
  if (import.meta.env.DEV) console.log('[userApi] fetchMe');
  const res = await apiFetch('/users/me');
  if (!res.ok) throw new Error('내 정보를 불러오지 못했습니다.');
  return res.json();
}
