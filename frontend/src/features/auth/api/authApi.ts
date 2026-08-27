import { apiFetch } from '../../../shared/api/apiClient';

export interface User { id: string; email: string; name: string; createdAt: string; updatedAt: string; }
export interface AuthTokens { accessToken: string; refreshToken: string; user: User; }

async function parseErrorOrThrow(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const message = body?.error?.message ?? '요청 처리 중 오류가 발생했습니다.';
  const code = body?.error?.code ?? 'UNKNOWN_ERROR';
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  throw err;
}

export async function signup(input: { email: string; password: string; name: string }): Promise<User> {
  const res = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(input) });
  if (!res.ok) return parseErrorOrThrow(res);
  const user = await res.json();
  if (import.meta.env.DEV) console.log('[auth] signup ok', user.email);
  return user;
}

export async function login(input: { email: string; password: string }): Promise<AuthTokens> {
  const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(input) });
  if (!res.ok) {
    if (import.meta.env.DEV) console.log('[auth] login fail', input.email);
    return parseErrorOrThrow(res);
  }
  const tokens = await res.json();
  if (import.meta.env.DEV) console.log('[auth] login ok', input.email);
  return tokens;
}
