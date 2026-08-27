import type { TodoStatus } from '../../entities/todo/model/todo.types';

export interface TodoStatusMeta {
  labelKey: string;
  icon: string;
  bg: string;
  text: string;
}

export const TODO_STATUS_META: Record<TodoStatus, TodoStatusMeta> = {
  NOT_STARTED: { labelKey: 'todo.status.notStarted', icon: '○', bg: 'var(--status-notstarted-bg)', text: 'var(--status-notstarted-text)' },
  IN_PROGRESS: { labelKey: 'todo.status.inProgress', icon: '◐', bg: 'var(--status-inprogress-bg)', text: 'var(--status-inprogress-text)' },
  OVERDUE: { labelKey: 'todo.status.overdue', icon: '!', bg: 'var(--status-overdue-bg)', text: 'var(--status-overdue-text)' },
  COMPLETED: { labelKey: 'todo.status.completed', icon: '●', bg: 'var(--status-completed-bg)', text: 'var(--status-completed-text)' },
};
