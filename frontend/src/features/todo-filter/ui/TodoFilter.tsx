import { Link } from 'react-router-dom';
import { useCategories } from '../../../entities/category/model/useCategories';
import { useFilterStore } from '../model/filterStore';
import type { TodoStatus } from '../../../entities/todo/model/todo.types';
import './todo-filter.css';

const STATUS_TABS: Array<{ label: string; value?: TodoStatus }> = [
  { label: '전체', value: undefined },
  { label: '시작전', value: 'NOT_STARTED' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
  { label: '지연', value: 'OVERDUE' },
];

export default function TodoFilter() {
  const { data: categories } = useCategories();
  const categoryId = useFilterStore((s) => s.categoryId);
  const status = useFilterStore((s) => s.status);
  const setCategoryId = useFilterStore((s) => s.setCategoryId);
  const setStatus = useFilterStore((s) => s.setStatus);

  const list = categories ?? [];

  return (
    <div className="todo-filter">
      <div className="todo-filter__desktop">
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
        <div className="todo-filter__status-tabs" role="tablist" aria-label="상태 필터">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              className={status === tab.value ? 'is-active' : ''}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="todo-filter__mobile">
        <label htmlFor="mobile-category-select">카테고리</label>
        <select
          id="mobile-category-select"
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value || undefined)}
        >
          <option value="">전체</option>
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label htmlFor="mobile-status-select">상태</label>
        <select
          id="mobile-status-select"
          value={status ?? ''}
          onChange={(e) => setStatus((e.target.value || undefined) as TodoStatus | undefined)}
        >
          {STATUS_TABS.map((tab) => (
            <option key={tab.label} value={tab.value ?? ''}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
