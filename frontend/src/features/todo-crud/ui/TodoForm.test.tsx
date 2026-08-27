import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCreateTodo, useUpdateTodo } from '../model/useTodoMutations';
import { useCategories } from '../../../entities/category/model/useCategories';
import type { Todo } from '../../../entities/todo/model/todo.types';
import TodoForm from './TodoForm';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../model/useTodoMutations', () => ({
  useCreateTodo: vi.fn(),
  useUpdateTodo: vi.fn(),
}));

vi.mock('../../../entities/category/model/useCategories', () => ({
  useCategories: vi.fn(),
}));

const mockedUseCreateTodo = vi.mocked(useCreateTodo);
const mockedUseUpdateTodo = vi.mocked(useUpdateTodo);
const mockedUseCategories = vi.mocked(useCategories);

const sampleTodo: Todo = {
  id: '1',
  categoryId: 'c1',
  title: '기존 할일',
  description: '설명',
  startDate: '2026-08-27',
  endDate: '2026-08-28',
  isCompleted: false,
  completedAt: null,
  status: 'NOT_STARTED',
  createdAt: 't',
  updatedAt: 't',
};

function renderForm(mode: 'create' | 'edit', initialTodo?: Todo) {
  return render(
    <MemoryRouter>
      <TodoForm mode={mode} initialTodo={initialTodo} />
    </MemoryRouter>
  );
}

function fillRequiredFields(overrides?: { startDate?: string; endDate?: string; title?: string }) {
  fireEvent.change(screen.getByLabelText(/제목/), {
    target: { value: overrides?.title ?? '새 할일' },
  });
  fireEvent.change(screen.getByLabelText(/시작일/), {
    target: { value: overrides?.startDate ?? '2026-08-27' },
  });
  fireEvent.change(screen.getByLabelText(/종료일/), {
    target: { value: overrides?.endDate ?? '2026-08-28' },
  });
}

describe('TodoForm', () => {
  let createMutateAsync: ReturnType<typeof vi.fn>;
  let updateMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate.mockReset();
    createMutateAsync = vi.fn();
    updateMutateAsync = vi.fn();
    mockedUseCreateTodo.mockReturnValue({ mutateAsync: createMutateAsync } as never);
    mockedUseUpdateTodo.mockReturnValue({ mutateAsync: updateMutateAsync } as never);
    mockedUseCategories.mockReturnValue({
      data: [
        { id: 'c1', name: '업무', isDefault: false },
        { id: 'c2', name: '개인', isDefault: true },
      ],
    } as never);
  });

  it('제목이 없으면 저장 시 에러가 표시되고 mutation이 호출되지 않는다', async () => {
    renderForm('create');

    fireEvent.change(screen.getByLabelText(/시작일/), { target: { value: '2026-08-27' } });
    fireEvent.change(screen.getByLabelText(/종료일/), { target: { value: '2026-08-28' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('제목을 입력해주세요.')).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('필수 항목을 올바르게 입력하고 저장하면 성공 시 /todos로 이동한다', async () => {
    createMutateAsync.mockResolvedValue(sampleTodo);
    renderForm('create');

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(createMutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/todos'));
  });

  it('시작일이 종료일보다 늦으면 검증 에러가 표시되고 mutation이 호출되지 않는다', async () => {
    renderForm('create');

    fillRequiredFields({ startDate: '2026-08-30', endDate: '2026-08-28' });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('종료일은 시작일 이후여야 합니다.')).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('mutation이 실패하면 에러 메시지가 화면에 표시된다', async () => {
    createMutateAsync.mockRejectedValue(new Error('서버 오류가 발생했습니다.'));
    renderForm('create');

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('서버 오류가 발생했습니다.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('create 모드에서는 완료 체크박스가 렌더되지 않는다', () => {
    renderForm('create');
    expect(screen.queryByLabelText(/완료로 표시/)).not.toBeInTheDocument();
  });

  it('edit 모드에서는 완료 체크박스가 렌더되고 체크 상태에 따라 안내 문구가 바뀐다', () => {
    renderForm('edit', sampleTodo);

    const checkbox = screen.getByLabelText(/완료로 표시/);
    expect(checkbox).toBeInTheDocument();

    const uncheckedText = document.body.textContent;

    fireEvent.click(checkbox);
    const checkedText = document.body.textContent;

    expect(checkedText).not.toEqual(uncheckedText);
  });

  it('카테고리를 선택하지 않으면 기본 카테고리 적용 안내 문구가 보인다', () => {
    renderForm('create');
    expect(screen.getByText(/선택 안 함/)).toBeInTheDocument();
  });
});
