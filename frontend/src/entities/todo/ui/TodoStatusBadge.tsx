import { TODO_STATUS_META } from '../../../shared/lib/todoStatus';
import { useT } from '../../../shared/lib/i18n/useT';
import type { TodoStatus } from '../model/todo.types';
import './todo-status-badge.css';

export default function TodoStatusBadge({ status }: { status: TodoStatus }) {
  const meta = TODO_STATUS_META[status];
  const t = useT();
  return (
    <span
      className="todo-status-badge"
      style={{ backgroundColor: meta.bg, color: meta.text }}
      role="status"
    >
      {meta.icon} {t(meta.labelKey)}
    </span>
  );
}
