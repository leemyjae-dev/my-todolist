import { useTodos } from '../../entities/todo/model/useTodos';
import { useCategories } from '../../entities/category/model/useCategories';
import { useFilterStore } from '../../features/todo-filter/model/filterStore';
import TodoCard from '../../entities/todo/ui/TodoCard';
import './todo-board.css';

const LIMIT = 20;

export default function TodoBoard() {
  const categoryId = useFilterStore((s) => s.categoryId);
  const status = useFilterStore((s) => s.status);
  const page = useFilterStore((s) => s.page);
  const setPage = useFilterStore((s) => s.setPage);

  const { data, isLoading } = useTodos({ categoryId, status, page, limit: LIMIT });
  const { data: categories } = useCategories();

  if (isLoading) {
    return <p>불러오는 중...</p>;
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="todo-board">
      {total === 0 ? (
        <p className="todo-board__empty">조건에 맞는 할일이 없습니다</p>
      ) : (
        <div className="todo-board__list">
          {items.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              categoryName={categories?.find((c) => c.id === todo.categoryId)?.name}
            />
          ))}
        </div>
      )}

      <div className="todo-board__pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button type="button" disabled={page * LIMIT >= total} onClick={() => setPage(page + 1)}>
          다음
        </button>
      </div>
    </div>
  );
}
