import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '../lib/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function log(...args: unknown[]): void {
  if (import.meta.env.DEV) console.log('[apiClient]', ...args);
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        throw new Error('refresh failed');
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = getAccessToken();
  const headers = new Headers(options.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  log('request', path);
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status !== 401 || path.startsWith('/auth/')) return res;

  log('401 detected, attempting refresh', path);
  try {
    const newAccessToken = await refreshAccessToken();
    log('refresh succeeded');
    const retryHeaders = new Headers(options.headers);
    retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
    if (options.body && !retryHeaders.has('Content-Type')) retryHeaders.set('Content-Type', 'application/json');
    return fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders });
  } catch {
    log('refresh failed, redirecting to login');
    clearTokens();
    window.location.href = '/login';
    return res;
  }
}
