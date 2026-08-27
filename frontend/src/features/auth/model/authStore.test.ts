import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setTokens, clearTokens, getAccessToken } from '../../../shared/lib/tokenStorage';

vi.mock('../../../shared/lib/tokenStorage', () => ({
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  setTokens: vi.fn(),
  setAccessToken: vi.fn(),
  clearTokens: vi.fn(),
}));

import { useAuthStore } from './authStore';

const mockedGetAccessToken = vi.mocked(getAccessToken);
const mockedSetTokens = vi.mocked(setTokens);
const mockedClearTokens = vi.mocked(clearTokens);

describe('authStore', () => {
  beforeEach(() => {
    mockedSetTokens.mockClear();
    mockedClearTokens.mockClear();
  });

  it('초기 상태: getAccessToken이 null이면 isAuthenticated는 false다', () => {
    expect(mockedGetAccessToken).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('login 호출 시 setTokens를 부르고 user/isAuthenticated를 갱신한다', () => {
    const tokens = {
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' },
    };

    useAuthStore.getState().login(tokens);

    expect(mockedSetTokens).toHaveBeenCalledWith({ accessToken: 'access', refreshToken: 'refresh' });
    expect(useAuthStore.getState().user).toEqual(tokens.user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logout 호출 시 clearTokens를 부르고 user/isAuthenticated를 초기화한다', () => {
    useAuthStore.getState().logout();

    expect(mockedClearTokens).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
