import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../../../shared/api/apiClient';
import { signup, login } from './authApi';

vi.mock('../../../shared/api/apiClient', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('authApi', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  describe('signup', () => {
    it('반환값이 User와 일치한다 (성공)', async () => {
      const user = { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' };
      mockedApiFetch.mockResolvedValue({ ok: true, json: async () => user } as Response);

      const result = await signup({ email: 'a@b.com', password: 'password1', name: '홍길동' });

      expect(result).toEqual(user);
      expect(mockedApiFetch).toHaveBeenCalledWith('/auth/signup', expect.objectContaining({ method: 'POST' }));
    });

    it('실패 시 메시지와 code를 담은 에러를 throw한다', async () => {
      mockedApiFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: { code: 'EMAIL_TAKEN', message: '이미 사용 중인 이메일입니다.' } }),
      } as Response);

      await expect(signup({ email: 'a@b.com', password: 'password1', name: '홍길동' })).rejects.toThrow(
        '이미 사용 중인 이메일입니다.'
      );

      try {
        await signup({ email: 'a@b.com', password: 'password1', name: '홍길동' });
        expect.unreachable();
      } catch (err) {
        expect((err as Error & { code: string }).code).toBe('EMAIL_TAKEN');
      }
    });
  });

  describe('login', () => {
    it('AuthTokens를 반환한다 (성공)', async () => {
      const tokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' },
      };
      mockedApiFetch.mockResolvedValue({ ok: true, json: async () => tokens } as Response);

      const result = await login({ email: 'a@b.com', password: 'password1' });

      expect(result).toEqual(tokens);
    });

    it('실패 시 메시지와 code를 담은 에러를 throw한다', async () => {
      mockedApiFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }),
      } as Response);

      await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
        '이메일 또는 비밀번호가 올바르지 않습니다.'
      );

      try {
        await login({ email: 'a@b.com', password: 'wrong' });
        expect.unreachable();
      } catch (err) {
        expect((err as Error & { code: string }).code).toBe('INVALID_CREDENTIALS');
      }
    });
  });
});
