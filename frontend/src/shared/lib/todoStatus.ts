import type { TodoStatus } from '../../entities/todo/model/todo.types';

export interface TodoStatusMeta {
  label: string;
  icon: string;
  bg: string;
  text: string;
}

export const TODO_STATUS_META: Record<TodoStatus, TodoStatusMeta> = {
  NOT_STARTED: { label: '시작전', icon: '○', bg: '#EDEFF3', text: '#5B6472' },
  IN_PROGRESS: { label: '진행중', icon: '◐', bg: '#E8F0FE', text: '#0B5CD7' },
  OVERDUE: { label: '지연', icon: '!', bg: '#FCEAEA', text: '#D93A3A' },
  COMPLETED: { label: '완료', icon: '●', bg: '#E6F6EC', text: '#1F9254' },
};
