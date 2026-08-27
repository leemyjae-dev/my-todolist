import { apiFetch } from '../../../shared/api/apiClient';
import type { TodoListParams, TodoListResponse } from '../model/todo.types';
import { translate } from '../../../shared/lib/i18n/translate';
import { useLocaleStore } from '../../../shared/lib/i18n/localeStore';

export async function fetchTodos(params: TodoListParams): Promise<TodoListResponse> {
  const qs = new URLSearchParams();
  if (params.categoryId) qs.set('categoryId', params.categoryId);
  if (params.status) qs.set('status', params.status);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  if (import.meta.env.DEV) console.log('[todoApi] fetchTodos', params);
  const res = await apiFetch(`/todos?${qs.toString()}`);
  if (!res.ok) throw new Error(translate(useLocaleStore.getState().locale, 'todo.errors.loadFailed'));
  return res.json();
}
