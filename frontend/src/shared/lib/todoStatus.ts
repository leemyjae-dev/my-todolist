import type { TodoStatus } from '../../entities/todo/model/todo.types';

export interface TodoStatusMeta {
  label: string;
  icon: string;
  bg: string;
  text: string;
}

export const TODO_STATUS_META: Record<TodoStatus, TodoStatusMeta> = {
  NOT_STARTED: { label: '시작전', icon: '○', bg: 'var(--status-notstarted-bg)', text: 'var(--status-notstarted-text)' },
  IN_PROGRESS: { label: '진행중', icon: '◐', bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' },
  OVERDUE: { label: '지연', icon: '!', bg: 'var(--status-overdue-bg)', text: 'var(--status-overdue-text)' },
  COMPLETED: { label: '완료', icon: '●', bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)' },
};
