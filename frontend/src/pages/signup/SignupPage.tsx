import SignupForm from '../../features/auth/ui/SignupForm';
import { useT } from '../../shared/lib/i18n/useT';
import '../authCard.css';

export default function SignupPage() {
  const t = useT();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-card__brand">my-todoList</p>
        <h2 className="auth-card__title">{t('auth.signup.title')}</h2>
        <SignupForm />
      </div>
    </div>
  );
}
