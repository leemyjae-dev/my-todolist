import { useState, type FormEvent } from 'react';
import { useCreateCategory } from '../model/useCategoryMutations';
import './category-form.css';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const createCategory = useCreateCategory();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (!name.trim()) {
      setFieldError('카테고리 이름을 입력해주세요.');
      return;
    }
    try {
      await createCategory.mutateAsync({ name });
      setName('');
    } catch (err) {
      setFieldError((err as Error).message);
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-category-name">새 카테고리 이름</label>
      <div className="category-form__row">
        <input
          id="new-category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={createCategory.isPending}>추가</button>
      </div>
      {fieldError && <p className="category-form__error">{fieldError}</p>}
    </form>
  );
}
