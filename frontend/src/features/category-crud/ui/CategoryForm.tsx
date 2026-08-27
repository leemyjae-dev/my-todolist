import { useState, type FormEvent } from 'react';
import { useCreateCategory } from '../model/useCategoryMutations';
import { useT } from '../../../shared/lib/i18n/useT';
import './category-form.css';

export default function CategoryForm() {
  const t = useT();
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const createCategory = useCreateCategory();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (!name.trim()) {
      setFieldError(t('category.nameRequired'));
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
      <label htmlFor="new-category-name">{t('category.newNameLabel')}</label>
      <div className="category-form__row">
        <input
          id="new-category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={createCategory.isPending}>{t('common.add')}</button>
      </div>
      {fieldError && <p className="category-form__error">{fieldError}</p>}
    </form>
  );
}
