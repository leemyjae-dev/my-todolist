import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Todo } from '../model/todo.types';
import TodoStatusBadge from './TodoStatusBadge';
import { useDeleteTodo } from '../../../features/todo-crud/model/useTodoMutations';
import ConfirmModal from '../../../shared/ui/ConfirmModal';
import { TODO_STATUS_META } from '../../../shared/lib/todoStatus';
import './todo-card.css';

interface TodoCardProps {
  todo: Todo;
  categoryName?: string;
}

export default function TodoCard({ todo, categoryName }: TodoCardProps) {
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
        <Link to={`/todos/${todo.id}/edit`}>수정</Link>
        <button type="button" onClick={() => setConfirmOpen(true)}>
          삭제
        </button>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="할일을 삭제하시겠습니까?"
        description={`"${todo.title}" 항목이 영구 삭제됩니다.`}
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
