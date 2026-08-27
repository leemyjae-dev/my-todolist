import LoginForm from '../../features/auth/ui/LoginForm';
import { useT } from '../../shared/lib/i18n/useT';
import '../authCard.css';

export default function LoginPage() {
  const t = useT();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-card__brand">my-todoList</p>
        <h2 className="auth-card__title">{t('auth.login.title')}</h2>
        <LoginForm />
      </div>
    </div>
  );
}
