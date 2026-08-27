import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../../entities/category/model/useCategories';
import { useCreateTodo, useUpdateTodo } from '../model/useTodoMutations';
import type { Todo } from '../../../entities/todo/model/todo.types';
import './todo-form.css';

interface TodoFormProps {
  mode: 'create' | 'edit';
  initialTodo?: Todo;
}

export default function TodoForm({ mode, initialTodo }: TodoFormProps) {
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
      setServerError('제목을 입력해주세요.');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setDateError('종료일은 시작일 이후여야 합니다.');
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
        <label htmlFor="todo-title">제목 *</label>
        <input id="todo-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-description">설명</label>
        <textarea id="todo-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-category">카테고리</label>
        <select id="todo-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">선택 안 함 (기본 카테고리 적용)</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {!categoryId && <p className="todo-form__hint">미지정 시 '기본' 카테고리로 등록됩니다.</p>}
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-start-date">시작일 *</label>
        <input id="todo-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-end-date">종료일 *</label>
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
            완료로 표시
          </label>
          <p className="todo-form__hint">
            {isCompleted
              ? '완료로 전환되며 완료 시각이 기록됩니다.'
              : '완료를 해제하면 날짜 기준으로 상태가 재계산됩니다.'}
          </p>
        </div>
      )}

      <div className="todo-form__actions">
        <button type="button" onClick={() => navigate('/todos')}>취소</button>
        <button type="submit" disabled={isSubmitting}>저장</button>
      </div>
    </form>
  );
}
