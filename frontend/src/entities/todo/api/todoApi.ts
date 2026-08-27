import { apiFetch } from '../../../shared/api/apiClient';
import type { TodoListParams, TodoListResponse } from '../model/todo.types';

export async function fetchTodos(params: TodoListParams): Promise<TodoListResponse> {
  const qs = new URLSearchParams();
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  if (import.meta.env.DEV) console.log('[todoApi] fetchTodos', params);
  const res = await apiFetch(`/todos?${qs.toString()}`);
  if (!res.ok) throw new Error('할일 목록을 불러오지 못했습니다.');
  return res.json();
}
