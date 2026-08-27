import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../../entities/category/model/useCategories';
import { useCreateTodo, useUpdateTodo } from '../model/useTodoMutations';
import type { Todo } from '../../../entities/todo/model/todo.types';
import { useT } from '../../../shared/lib/i18n/useT';
import './todo-form.css';

interface TodoFormProps {
  mode: 'create' | 'edit';
  initialTodo?: Todo;
}

export default function TodoForm({ mode, initialTodo }: TodoFormProps) {
  const t = useT();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const [title, setTitle] = useState(initialTodo?.title ?? '');
  const [description, setDescription] = useState(initialTodo?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialTodo?.categoryId ?? '');
  const [startDate, setStartDate] = useState(initialTodo?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialTodo?.endDate ?? '');
  const [isCompleted, setIsCompleted] = useState(initialTodo?.isCompleted ?? false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const isSubmitting = createTodo.isPending || updateTodo.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!title.trim()) {
      setDateError(null);
      setServerError(t('todo.form.titleRequired'));
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setDateError(t('todo.form.dateOrderInvalid'));
      return;
    }
    setDateError(null);

    const input = {
      title,
      description: description || undefined,
      categoryId: categoryId || undefined,
      startDate,
      endDate,
      ...(mode === 'edit' ? { isCompleted } : {}),
    };

    try {
      if (mode === 'create') {
        await createTodo.mutateAsync(input);
      } else if (initialTodo) {
        await updateTodo.mutateAsync({ id: initialTodo.id, input });
      }
      navigate('/todos');
    } catch (err) {
      setServerError((err as Error).message);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      {serverError && <p className="todo-form__server-error" role="alert">{serverError}</p>}

      <div className="todo-form__field">
        <label htmlFor="todo-title">{t('todo.form.titleLabel')}</label>
        <input id="todo-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-description">{t('todo.form.descriptionLabel')}</label>
        <textarea id="todo-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-category">{t('todo.form.categoryLabel')}</label>
        <select id="todo-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t('todo.form.categoryNone')}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {!categoryId && <p className="todo-form__hint">{t('todo.form.categoryHint')}</p>}
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-start-date">{t('todo.form.startDateLabel')}</label>
        <input id="todo-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-end-date">{t('todo.form.endDateLabel')}</label>
        <input id="todo-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        {dateError && <p className="todo-form__error">{dateError}</p>}
      </div>

      {mode === 'edit' && (
        <div className="todo-form__field todo-form__field--checkbox">
          <label>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            {t('todo.form.completedLabel')}
          </label>
          <p className="todo-form__hint">
            {isCompleted
              ? t('todo.form.completedHintOn')
              : t('todo.form.completedHintOff')}
          </p>
        </div>
      )}

      <div className="todo-form__actions">
        <button type="button" onClick={() => navigate('/todos')}>{t('common.cancel')}</button>
        <button type="submit" disabled={isSubmitting}>{t('common.save')}</button>
      </div>
    </form>
  );
}
