import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/model/authStore';
import TodoFilter from '../../features/todo-filter/ui/TodoFilter';
import TodoBoard from '../../widgets/todo-board/TodoBoard';
import './todo-list-page.css';

export default function TodoListPage() {
  const navigate = useNavigate();

  function handleLogout() {
    useAuthStore.getState().logout();
    navigate('/login');
  }

  return (
    <div className="todo-list-page">
      <header className="todo-list-page__header">
        <h1>my-todoList</h1>
        <div className="todo-list-page__header-actions">
          <Link to="/todos/new" className="todo-list-page__add-desktop">
            + 할일 추가
          </Link>
          <Link to="/profile">내 정보</Link>
          <button type="button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <TodoFilter />
      <TodoBoard />

      <Link to="/todos/new" className="fab">
        +
      </Link>
    </div>
  );
}
