import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../../../shared/api/apiClient';
import { fetchTodos } from './todoApi';
import type { TodoListResponse } from '../model/todo.types';

vi.mock('../../../shared/api/apiClient', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('todoApi', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  describe('fetchTodos', () => {
    const response: TodoListResponse = { items: [], page: 1, limit: 20, total: 0 };

    it('params이 모두 있을 때 쿼리스트링을 구성한다', async () => {
      mockedApiFetch.mockResolvedValue({ ok: true, json: async () => response } as Response);

      await fetchTodos({ categoryId: 'cat-1', status: 'IN_PROGRESS', page: 2, limit: 10 });

      expect(mockedApiFetch).toHaveBeenCalledWith(
        '/todos?categoryId=cat-1&status=IN_PROGRESS&page=2&limit=10'
      );
    });

    it('params이 없을 때 빈 쿼리스트링을 구성한다', async () => {
      mockedApiFetch.mockResolvedValue({ ok: true, json: async () => response } as Response);

      await fetchTodos({});

      expect(mockedApiFetch).toHaveBeenCalledWith('/todos?');
    });

    it('성공 시 TodoListResponse를 반환한다', async () => {
      mockedApiFetch.mockResolvedValue({ ok: true, json: async () => response } as Response);

      const result = await fetchTodos({});

      expect(result).toEqual(response);
    });

    it('실패 시 에러를 throw한다', async () => {
      mockedApiFetch.mockResolvedValue({ ok: false, json: async () => ({}) } as Response);

      await expect(fetchTodos({})).rejects.toThrow('할일 목록을 불러오지 못했습니다.');
    });
  });
});
