import { useT } from '../shared/lib/i18n/useT';
import './error-fallback.css';

interface ErrorFallbackProps {
  onRetry: () => void;
}

export default function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const t = useT();
  return (
    <div className="error-fallback">
      <div className="error-fallback__box">
        <h2>{t('app.errorBoundary.title')}</h2>
        <p>{t('app.errorBoundary.description')}</p>
        <button type="button" onClick={onRetry}>
          {t('app.errorBoundary.retry')}
        </button>
      </div>
    </div>
  );
}
