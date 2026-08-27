import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TodoCard from './TodoCard';
import type { Todo } from '../model/todo.types';

const mutateAsync = vi.fn();

vi.mock('../../../features/todo-crud/model/useTodoMutations', () => ({
  useDeleteTodo: () => ({ mutateAsync }),
}));

const sampleTodo: Todo = {
  id: '1',
  categoryId: 'c1',
  title: '샘플 할일',
  description: null,
  startDate: '2026-08-27',
  endDate: '2026-08-28',
  isCompleted: false,
  completedAt: null,
  status: 'NOT_STARTED',
  createdAt: 't',
  updatedAt: 't',
};

function renderCard() {
  return render(
    <MemoryRouter>
      <TodoCard todo={sampleTodo} categoryName="업무" />
    </MemoryRouter>
  );
}

describe('TodoCard 삭제', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it('삭제 버튼 클릭 시 확인 모달이 나타난다', () => {
    renderCard();
    fireEvent.click(screen.getByText('삭제'));
    expect(screen.getByText('할일을 삭제하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('"샘플 할일" 항목이 영구 삭제됩니다.')).toBeInTheDocument();
  });

  it('모달에서 삭제 확인 클릭 시 mutateAsync가 todo id로 호출된다', () => {
    renderCard();
    fireEvent.click(screen.getByText('삭제'));
    fireEvent.click(screen.getAllByText('삭제')[1]);
    expect(mutateAsync).toHaveBeenCalledWith('1');
  });

  it('모달에서 취소 클릭 시 mutateAsync가 호출되지 않고 모달이 닫힌다', () => {
    renderCard();
    fireEvent.click(screen.getByText('삭제'));
    fireEvent.click(screen.getByText('취소'));
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.queryByText('할일을 삭제하시겠습니까?')).toBeNull();
  });
});
