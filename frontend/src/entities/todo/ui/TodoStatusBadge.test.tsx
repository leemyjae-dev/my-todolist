import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoStatusBadge from './TodoStatusBadge';
import type { TodoStatus } from '../model/todo.types';

describe('TodoStatusBadge', () => {
  const cases: Array<[TodoStatus, string]> = [
    ['NOT_STARTED', '시작전'],
    ['IN_PROGRESS', '진행중'],
    ['OVERDUE', '지연'],
    ['COMPLETED', '완료'],
  ];

  it.each(cases)('%s 상태는 "%s" 라벨을 표시한다', (status, label) => {
    render(<TodoStatusBadge status={status} />);
    expect(screen.getByRole('status')).toHaveTextContent(label);
  });
});
