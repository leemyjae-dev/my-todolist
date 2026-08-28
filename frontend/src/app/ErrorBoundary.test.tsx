import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Bomb() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('정상 렌더링 시 자식을 그대로 표시한다', () => {
    render(
      <ErrorBoundary>
        <div>정상 콘텐츠</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
  });

  it('자식에서 에러가 발생하면 fallback UI를 표시한다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
