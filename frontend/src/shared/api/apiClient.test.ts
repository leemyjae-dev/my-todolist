import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from './apiClient';

function jsonResponse(body: unknown, ok: boolean, status: number): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('attaches Authorization header from stored access token', async () => {
    localStorage.setItem('mtl_access_token', 'access-token');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({}, true, 200)
    );

    await apiFetch('/todos');

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const headers = new Headers((options as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer access-token');
  });

  it('does not call refresh endpoint when first request succeeds', async () => {
    localStorage.setItem('mtl_access_token', 'access-token');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({}, true, 200)
    );

    await apiFetch('/todos');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('refreshes token and retries original request on 401', async () => {
    localStorage.setItem('mtl_access_token', 'expired-token');
    localStorage.setItem('mtl_refresh_token', 'refresh-token');

    const finalResponse = jsonResponse({ id: 1 }, true, 200);
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(jsonResponse({}, false, 401))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'new-token' }, true, 200))
      .mockResolvedValueOnce(finalResponse);

    const result = await apiFetch('/todos');

    expect(fetch).toHaveBeenCalledTimes(3);

    const refreshCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[1];
    expect(refreshCall[0]).toContain('/auth/token/refresh');

    const retryCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[2];
    const retryHeaders = new Headers((retryCall[1] as RequestInit).headers);
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token');

    expect(localStorage.getItem('mtl_access_token')).toBe('new-token');
    expect(result).toBe(finalResponse);
  });

  it('clears tokens and redirects to /login when refresh fails', async () => {
    localStorage.setItem('mtl_access_token', 'expired-token');
    localStorage.setItem('mtl_refresh_token', 'refresh-token');

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(jsonResponse({}, false, 401))
      .mockResolvedValueOnce(jsonResponse({}, false, 401));

    await apiFetch('/todos');

    expect(localStorage.getItem('mtl_access_token')).toBeNull();
    expect(localStorage.getItem('mtl_refresh_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});
