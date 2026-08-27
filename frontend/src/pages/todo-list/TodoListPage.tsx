import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/model/authStore';
import TodoFilter from '../../features/todo-filter/ui/TodoFilter';
import CategorySidebar from '../../features/todo-filter/ui/CategorySidebar';
import TodoBoard from '../../widgets/todo-board/TodoBoard';
import ThemeToggle from '../../shared/ui/ThemeToggle';
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
        <div className="todo-list-page__brand">
          <span className="todo-list-page__logo" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h1>my-todoList</h1>
        </div>
        <div className="todo-list-page__header-actions">
          <ThemeToggle />
          <Link to="/todos/new" className="todo-list-page__add-desktop todo-list-page__add-button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            할일 추가
          </Link>
          <Link to="/profile" className="todo-list-page__text-link">내 정보</Link>
          <button type="button" className="todo-list-page__text-link" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="todo-list-page__body">
        <CategorySidebar />
        <div className="todo-list-page__main">
          <TodoFilter />
          <TodoBoard />
        </div>
      </div>

      <Link to="/todos/new" className="fab">
        +
      </Link>
    </div>
  );
}
