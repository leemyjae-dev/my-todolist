import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../../../shared/api/apiClient';
import { fetchCategories } from './categoryApi';
import type { Category } from '../model/category.types';

vi.mock('../../../shared/api/apiClient', () => ({ apiFetch: vi.fn() }));

const mockedApiFetch = vi.mocked(apiFetch);

describe('categoryApi', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  describe('fetchCategories', () => {
    const categories: Category[] = [{ id: '1', name: '기본', isDefault: true }];

    it('성공 시 Category 배열을 반환한다', async () => {
      mockedApiFetch.mockResolvedValue({ ok: true, json: async () => categories } as Response);

      const result = await fetchCategories();

      expect(result).toEqual(categories);
      expect(mockedApiFetch).toHaveBeenCalledWith('/categories');
    });

    it('실패 시 에러를 throw한다', async () => {
      mockedApiFetch.mockResolvedValue({ ok: false, json: async () => ({}) } as Response);

      await expect(fetchCategories()).rejects.toThrow('카테고리 목록을 불러오지 못했습니다.');
    });
  });
});
