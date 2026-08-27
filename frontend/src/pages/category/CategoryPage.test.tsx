import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCategories } from '../../entities/category/model/useCategories';
import { useDeleteCategory } from '../../features/category-crud/model/useCategoryMutations';
import CategoryPage from './CategoryPage';

vi.mock('../../entities/category/model/useCategories', () => ({
  useCategories: vi.fn(),
}));

vi.mock('../../features/category-crud/model/useCategoryMutations', () => ({
  useCreateCategory: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeleteCategory: vi.fn(),
}));

const mockedUseCategories = vi.mocked(useCategories);
const mockedUseDeleteCategory = vi.mocked(useDeleteCategory);

const categories = [
  { id: 'default1', name: '기본', isDefault: true },
  { id: 'c1', name: '업무', isDefault: false },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CategoryPage />
    </MemoryRouter>
  );
}

describe('CategoryPage', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn();
    mockedUseCategories.mockReturnValue({ data: categories } as never);
    mockedUseDeleteCategory.mockReturnValue({ mutateAsync } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('기본 카테고리는 삭제 불가 텍스트가 있고 삭제 버튼 수는 일반 카테고리 수와 같다', () => {
    renderPage();

    expect(screen.getByText('삭제 불가')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '삭제' })).toHaveLength(1);
  });

  it('삭제 버튼 클릭 시 카테고리 이름을 포함한 확인 모달이 나타난다', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/업무/)).toBeInTheDocument();
  });

  it('모달 확인 클릭 시 삭제가 호출되고 토스트가 나타났다가 3초 후 사라진다', async () => {
    vi.useFakeTimers();
    mutateAsync.mockResolvedValue(undefined);
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    const dialog = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));
      await Promise.resolve();
    });

    expect(mutateAsync).toHaveBeenCalledWith('c1');
    expect(screen.getByText('삭제되었습니다.')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('삭제되었습니다.')).not.toBeInTheDocument();
  });
});
