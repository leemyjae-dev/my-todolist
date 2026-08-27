import { useEffect } from 'react';
import './confirm-modal.css';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = '삭제',
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="confirm-modal__actions">
          <button type="button" onClick={onCancel}>취소</button>
          <button type="button" className="confirm-modal__confirm" onClick={onConfirm} disabled={isConfirming}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
