import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useMe } from '../../entities/user/model/useMe';
import ProfilePage from './ProfilePage';
import type { User } from '../../features/auth/api/authApi';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../entities/user/model/useMe', () => ({ useMe: vi.fn() }));

vi.mock('../../features/user-profile/ui/ProfileForm', () => ({
  default: ({ onSaved }: { onSaved: () => void }) => (
    <button onClick={onSaved}>저장(스텁)</button>
  ),
}));

const mockedUseMe = vi.mocked(useMe);

const sampleUser: User = { id: '1', email: 'a@b.com', name: '홍길동', createdAt: 't', updatedAt: 't' };

describe('ProfilePage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('로딩 중이면 로딩 텍스트만 보이고 폼은 보이지 않는다', () => {
    mockedUseMe.mockReturnValue({ data: undefined, isLoading: true } as never);

    render(<ProfilePage />);

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    expect(screen.queryByText('저장(스텁)')).not.toBeInTheDocument();
  });

  it('내 정보 조회 성공 시 폼이 렌더된다', () => {
    mockedUseMe.mockReturnValue({ data: sampleUser, isLoading: false } as never);

    render(<ProfilePage />);

    expect(screen.getByText('저장(스텁)')).toBeInTheDocument();
  });

  it('저장 완료 시 토스트가 표시되고 1초 후 /todos로 이동한다', () => {
    vi.useFakeTimers();
    mockedUseMe.mockReturnValue({ data: sampleUser, isLoading: false } as never);

    render(<ProfilePage />);

    act(() => {
      screen.getByText('저장(스텁)').click();
    });

    expect(screen.getByText('저장되었습니다.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/todos');
  });
});
