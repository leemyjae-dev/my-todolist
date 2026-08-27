import { Link, useParams } from 'react-router-dom';
import { useTodos } from '../../entities/todo/model/useTodos';
import TodoForm from '../../features/todo-crud/ui/TodoForm';

export default function TodoFormPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="todo-form-page">
        <h2>할일 추가</h2>
        <TodoForm mode="create" />
      </div>
    );
  }

  const { data, isLoading } = useTodos({ limit: 100 });
  const todo = data?.items.find((t) => t.id === id);

  if (isLoading) return <div className="todo-form-page">불러오는 중...</div>;

  if (!todo) {
    return (
      <div className="todo-form-page">
        <p>할일 정보를 불러올 수 없습니다.</p>
        <Link to="/todos">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="todo-form-page">
      <h2>할일 수정</h2>
      <TodoForm mode="edit" initialTodo={todo} />
    </div>
  );
}
