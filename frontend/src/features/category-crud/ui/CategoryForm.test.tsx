import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useCreateCategory } from '../model/useCategoryMutations';
import CategoryForm from './CategoryForm';

vi.mock('../model/useCategoryMutations', () => ({
  useCreateCategory: vi.fn(),
}));

const mockedUseCreateCategory = vi.mocked(useCreateCategory);

describe('CategoryForm', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn();
    mockedUseCreateCategory.mockReturnValue({ mutateAsync } as never);
  });

  it('빈 값으로 추가 클릭 시 mutation이 호출되지 않고 에러가 표시된다', () => {
    render(<CategoryForm />);

    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(screen.getByText('카테고리 이름을 입력해주세요.')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('이름 입력 후 추가하면 성공 시 입력창이 비워진다', async () => {
    mutateAsync.mockResolvedValue({ id: 'c1', name: '업무', isDefault: false });
    render(<CategoryForm />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '업무' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ name: '업무' }));
    await waitFor(() => expect(input.value).toBe(''));
  });

  it('mutation이 실패하면 에러 메시지가 표시된다', async () => {
    mutateAsync.mockRejectedValue(new Error('이미 사용 중인 카테고리 이름입니다.'));
    render(<CategoryForm />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '업무' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    expect(await screen.findByText('이미 사용 중인 카테고리 이름입니다.')).toBeInTheDocument();
  });
});
