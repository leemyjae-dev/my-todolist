import { useCategories } from '../../../entities/category/model/useCategories';
import { useFilterStore } from '../model/filterStore';
import type { TodoStatus } from '../../../entities/todo/model/todo.types';
import { useT } from '../../../shared/lib/i18n/useT';
import './todo-filter.css';

const STATUS_TABS: Array<{ labelKey: string; value?: TodoStatus }> = [
  { labelKey: 'todo.filter.all', value: undefined },
  { labelKey: 'todo.status.notStarted', value: 'NOT_STARTED' },
  { labelKey: 'todo.status.inProgress', value: 'IN_PROGRESS' },
  { labelKey: 'todo.status.completed', value: 'COMPLETED' },
  { labelKey: 'todo.status.overdue', value: 'OVERDUE' },
];

export default function TodoFilter() {
  const t = useT();
  const { data: categories } = useCategories();
  const categoryId = useFilterStore((s) => s.categoryId);
  const status = useFilterStore((s) => s.status);
  const setCategoryId = useFilterStore((s) => s.setCategoryId);
  const setStatus = useFilterStore((s) => s.setStatus);

  const list = categories ?? [];

  return (
    <div className="todo-filter">
      <div className="todo-filter__desktop todo-filter__status-tabs" role="tablist" aria-label={t('todo.filter.statusFilterAria')}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.labelKey}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            className={status === tab.value ? 'is-active' : ''}
            onClick={() => setStatus(tab.value)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="todo-filter__mobile">
        <label htmlFor="mobile-category-select">{t('todo.filter.categoryLabel')}</label>
        <select
          id="mobile-category-select"
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value || undefined)}
        >
          <option value="">{t('todo.filter.all')}</option>
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label htmlFor="mobile-status-select">{t('todo.filter.statusLabel')}</label>
        <select
          id="mobile-status-select"
          value={status ?? ''}
          onChange={(e) => setStatus((e.target.value || undefined) as TodoStatus | undefined)}
        >
          {STATUS_TABS.map((tab) => (
            <option key={tab.labelKey} value={tab.value ?? ''}>
              {t(tab.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
