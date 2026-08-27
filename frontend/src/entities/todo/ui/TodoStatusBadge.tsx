import { TODO_STATUS_META } from '../../../shared/lib/todoStatus';
import type { TodoStatus } from '../model/todo.types';

export default function TodoStatusBadge({ status }: { status: TodoStatus }) {
  const meta = TODO_STATUS_META[status];
  return (
    <span
      className="todo-status-badge"
      style={{ backgroundColor: meta.bg, color: meta.text }}
      role="status"
    >
      {meta.icon} {meta.label}
    </span>
  );
}
