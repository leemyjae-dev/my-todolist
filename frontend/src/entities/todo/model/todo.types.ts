export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED';

export interface Todo {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  completedAt: string | null;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TodoListResponse {
  items: Todo[];
  page: number;
  limit: number;
  total: number;
}

export interface TodoListParams {
  categoryId?: string;
  status?: TodoStatus;
  page?: number;
  limit?: number;
}
