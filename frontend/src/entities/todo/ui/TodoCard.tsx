import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Todo } from '../model/todo.types';
import TodoStatusBadge from './TodoStatusBadge';
import { useDeleteTodo } from '../../../features/todo-crud/model/useTodoMutations';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import { TODO_STATUS_META } from '../../../shared/lib/todoStatus';
import { useT } from '../../../shared/lib/i18n/useT';
import './todo-card.css';

interface TodoCardProps {
  todo: Todo;
  categoryName?: string;
}

export default function TodoCard({ todo, categoryName }: TodoCardProps) {
  const t = useT();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteTodo = useDeleteTodo();
  const accentColor = TODO_STATUS_META[todo.status].text;

  return (
    <div className="todo-card" style={{ borderLeftColor: accentColor }}>
      <div className="todo-card__header">
        <h3
          className="todo-card__title"
          style={todo.isCompleted ? { textDecoration: 'line-through' } : undefined}
        >
          {todo.title}
        </h3>
        <TodoStatusBadge status={todo.status} />
      </div>
      {categoryName && <span className="todo-card__category">{categoryName}</span>}
      <p className="todo-card__period">
        {todo.startDate} ~ {todo.endDate}
      </p>
      <div className="todo-card__actions">
        <Link to={`/todos/${todo.id}/edit`}>{t('todo.card.editLink')}</Link>
        <button type="button" onClick={() => setConfirmOpen(true)}>
          {t('common.delete')}
        </button>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={t('todo.card.deleteConfirmTitle')}
        description={t('todo.card.deleteConfirmDescription', { title: todo.title })}
        isConfirming={deleteTodo.isPending}
        onConfirm={async () => {
          await deleteTodo.mutateAsync(todo.id);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
