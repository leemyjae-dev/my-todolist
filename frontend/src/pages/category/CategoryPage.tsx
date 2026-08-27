import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../entities/category/model/useCategories';
import { useDeleteCategory } from '../../features/category-crud/model/useCategoryMutations';
import CategoryForm from '../../features/category-crud/ui/CategoryForm';
import ConfirmModal from '../../shared/ui/ConfirmModal';
import { useT } from '../../shared/lib/i18n/useT';
import type { Category } from '../../entities/category/model/category.types';
import './category-page.css';

export default function CategoryPage() {
  const t = useT();
  const { data: categories } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [target, setTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!target) return;
    await deleteCategory.mutateAsync(target.id);
    setTarget(null);
    setToast(t('category.deleted'));
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="category-page">
      <Link to="/todos">{t('category.backToList')}</Link>
      <h2>{t('category.title')}</h2>
      <CategoryForm />
      <ul className="category-page__list">
        {categories?.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            {category.isDefault ? (
              <span className="category-page__disabled">{t('category.cannotDelete')}</span>
            ) : (
              <button onClick={() => setTarget(category)}>{t('common.delete')}</button>
            )}
          </li>
        ))}
      </ul>
      {toast && <p className="category-page__toast" role="status">{toast}</p>}
      <ConfirmModal
        open={!!target}
        title={t('category.deleteConfirmTitle', { name: target?.name ?? '' })}
        description={t('category.deleteConfirmDescription')}
        isConfirming={deleteCategory.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
