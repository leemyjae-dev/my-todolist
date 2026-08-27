import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../entities/category/model/useCategories';
import { useDeleteCategory } from '../../features/category-crud/model/useCategoryMutations';
import CategoryForm from '../../features/category-crud/ui/CategoryForm';
import ConfirmModal from '../../shared/ui/ConfirmModal';
import type { Category } from '../../entities/category/model/category.types';
import './category-page.css';

export default function CategoryPage() {
  const { data: categories } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [target, setTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!target) return;
    await deleteCategory.mutateAsync(target.id);
    setTarget(null);
    setToast('삭제되었습니다.');
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="category-page">
      <Link to="/todos">&lt; 목록으로</Link>
      <h2>카테고리 관리</h2>
      <CategoryForm />
      <ul className="category-page__list">
        {categories?.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            {category.isDefault ? (
              <span className="category-page__disabled">삭제 불가</span>
            ) : (
              <button onClick={() => setTarget(category)}>삭제</button>
            )}
          </li>
        ))}
      </ul>
      {toast && <p className="category-page__toast" role="status">{toast}</p>}
      <ConfirmModal
        open={!!target}
        title={`"${target?.name}" 카테고리를 삭제하시겠습니까?`}
        description="소속된 할일은 모두 '기본' 카테고리로 이동합니다."
        isConfirming={deleteCategory.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
