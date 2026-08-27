import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodos } from '../../entities/todo/model/useTodos';
import { useCategories } from '../../entities/category/model/useCategories';
import { useFilterStore } from '../../features/todo-filter/model/filterStore';
import TodoBoard from './TodoBoard';
import type { Todo } from '../../entities/todo/model/todo.types';

vi.mock('../../entities/todo/model/useTodos', () => ({ useTodos: vi.fn() }));
vi.mock('../../entities/category/model/useCategories', () => ({ useCategories: vi.fn() }));

const mockedUseTodos = vi.mocked(useTodos);
const mockedUseCategories = vi.mocked(useCategories);

function makeTodo(id: string): Todo {
  return {
    id,
    categoryId: 'cat-1',
    title: `할일 ${id}`,
    description: null,
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    isCompleted: false,
    completedAt: null,
    status: 'NOT_STARTED',
    createdAt: 't',
    updatedAt: 't',
  };
}

function renderBoard() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TodoBoard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TodoBoard', () => {
  beforeEach(() => {
    useFilterStore.setState({ categoryId: undefined, status: undefined, page: 1 });
    mockedUseCategories.mockReturnValue({
      data: [{ id: 'cat-1', name: '업무', isDefault: true }],
    } as never);
  });

  it('할일 목록을 카드로 렌더한다', () => {
    mockedUseTodos.mockReturnValue({
      data: { items: [makeTodo('1'), makeTodo('2')], page: 1, limit: 20, total: 2 },
      isLoading: false,
    } as never);

    renderBoard();

    expect(screen.getByText('할일 1')).toBeInTheDocument();
    expect(screen.getByText('할일 2')).toBeInTheDocument();
  });

  it('total이 0이면 안내 문구를 표시한다', () => {
    mockedUseTodos.mockReturnValue({
      data: { items: [], page: 1, limit: 20, total: 0 },
      isLoading: false,
    } as never);

    renderBoard();

    expect(screen.getByText('조건에 맞는 할일이 없습니다')).toBeInTheDocument();
  });

  it('첫 페이지에서는 이전 버튼이 비활성화된다', () => {
    useFilterStore.setState({ page: 1 });
    mockedUseTodos.mockReturnValue({
      data: { items: [makeTodo('1')], page: 1, limit: 20, total: 30 },
      isLoading: false,
    } as never);

    renderBoard();

    expect(screen.getByRole('button', { name: '이전' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '다음' })).not.toBeDisabled();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('마지막 페이지에서는 다음 버튼이 비활성화된다', () => {
    useFilterStore.setState({ page: 2 });
    mockedUseTodos.mockReturnValue({
      data: { items: [makeTodo('1')], page: 2, limit: 20, total: 30 },
      isLoading: false,
    } as never);

    renderBoard();

    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
  });
});
