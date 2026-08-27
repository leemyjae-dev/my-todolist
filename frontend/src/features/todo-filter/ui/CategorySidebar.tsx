import { Link } from 'react-router-dom';
import { useCategories } from '../../../entities/category/model/useCategories';
import { useFilterStore } from '../model/filterStore';
import './todo-filter.css';

export default function CategorySidebar() {
  const { data: categories } = useCategories();
  const categoryId = useFilterStore((s) => s.categoryId);
  const setCategoryId = useFilterStore((s) => s.setCategoryId);

  const list = categories ?? [];

  return (
    <aside className="todo-filter__panel">
      <div className="todo-filter__panel-title">카테고리</div>
      <div className="todo-filter__categories" role="radiogroup" aria-label="카테고리 필터">
        <label>
          <input
            type="radio"
            name="category"
            checked={categoryId === undefined}
            onChange={() => setCategoryId(undefined)}
          />
          전체
        </label>
        {list.map((c) => (
          <label key={c.id}>
            <input
              type="radio"
              name="category"
              checked={categoryId === c.id}
              onChange={() => setCategoryId(c.id)}
            />
            {c.name}
          </label>
        ))}
      </div>
      <Link to="/categories" className="todo-filter__manage-link">
        카테고리 관리 &gt;
      </Link>
    </aside>
  );
}
