import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '../api/todoApi';
import type { TodoListParams } from './todo.types';

export function useTodos(params: TodoListParams) {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => fetchTodos(params),
  });
}
