import { apiFetch } from '../../../shared/api/apiClient';
import type { Category } from '../model/category.types';

export async function fetchCategories(): Promise<Category[]> {
  if (import.meta.env.DEV) console.log('[categoryApi] fetchCategories');
  const res = await apiFetch('/categories');
  if (!res.ok) throw new Error('카테고리 목록을 불러오지 못했습니다.');
  return res.json();
}
