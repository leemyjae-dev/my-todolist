import { Link, useParams } from 'react-router-dom';
import { useTodos } from '../../entities/todo/model/useTodos';
import TodoForm from '../../features/todo-crud/ui/TodoForm';
import { useT } from '../../shared/lib/i18n/useT';

export default function TodoFormPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="todo-form-page">
        <h2>{t('todo.form.addTitle')}</h2>
        <TodoForm mode="create" />
      </div>
    );
  }

  const { data, isLoading } = useTodos({ limit: 100 });
  const todo = data?.items.find((t) => t.id === id);

  if (isLoading) return <div className="todo-form-page">{t('common.loading')}</div>;

  if (!todo) {
    return (
      <div className="todo-form-page">
        <p>{t('todo.form.notFound')}</p>
        <Link to="/todos">{t('todo.form.backToList')}</Link>
      </div>
    );
  }

  return (
    <div className="todo-form-page">
      <h2>{t('todo.form.editTitle')}</h2>
      <TodoForm mode="edit" initialTodo={todo} />
    </div>
  );
}
