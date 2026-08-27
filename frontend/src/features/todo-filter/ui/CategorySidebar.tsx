import { Link } from 'react-router-dom';
import { useCategories } from '../../../entities/category/model/useCategories';
import { useFilterStore } from '../model/filterStore';
import { useT } from '../../../shared/lib/i18n/useT';
import './todo-filter.css';

export default function CategorySidebar() {
  const t = useT();
  const { data: categories } = useCategories();
  const categoryId = useFilterStore((s) => s.categoryId);
  const setCategoryId = useFilterStore((s) => s.setCategoryId);

  const list = categories ?? [];

  return (
    <aside className="todo-filter__panel">
      <div className="todo-filter__panel-title">{t('todo.filter.categoryLabel')}</div>
      <div className="todo-filter__categories" role="radiogroup" aria-label={t('todo.filter.categoryFilterAria')}>
        <label>
          <input
            type="radio"
            name="category"
            checked={categoryId === undefined}
            onChange={() => setCategoryId(undefined)}
          />
          {t('todo.filter.all')}
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
        {t('todo.filter.manageLink')}
      </Link>
    </aside>
  );
}
