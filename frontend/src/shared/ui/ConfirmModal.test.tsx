import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from './ConfirmModal';

function setup(overrides: Partial<React.ComponentProps<typeof ConfirmModal>> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const utils = render(
    <ConfirmModal
      open
      title="할일을 삭제하시겠습니까?"
      description="설명 텍스트"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onConfirm, onCancel, ...utils };
}

describe('ConfirmModal', () => {
  it('open=false면 아무것도 렌더하지 않는다', () => {
    render(
      <ConfirmModal
        open={false}
        title="할일을 삭제하시겠습니까?"
        description="설명 텍스트"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByText('할일을 삭제하시겠습니까?')).toBeNull();
  });

  it('open=true면 title/description을 렌더한다', () => {
    setup();
    expect(screen.getByText('할일을 삭제하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('설명 텍스트')).toBeInTheDocument();
  });

  it('오버레이 클릭 시 onCancel이 호출된다', () => {
    const { onCancel } = setup();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement as HTMLElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('모달박스 내부 클릭 시 onCancel이 호출되지 않는다', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByText('할일을 삭제하시겠습니까?'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 onCancel이 호출된다', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirmLabel 버튼 클릭 시 onConfirm이 호출된다', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByText('삭제'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('isConfirming=true면 확인 버튼이 disabled 된다', () => {
    setup({ isConfirming: true });
    expect(screen.getByText('삭제')).toBeDisabled();
  });

  it('ESC 키 입력 시 onCancel이 호출된다', () => {
    const { onCancel } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
