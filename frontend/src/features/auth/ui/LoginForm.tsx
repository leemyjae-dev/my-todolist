import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuthStore } from '../model/authStore';
import { useT } from '../../../shared/lib/i18n/useT';
import './authForm.css';

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errors: FieldErrors = {
      email: email ? undefined : t('auth.validation.emailRequired'),
      password: password ? undefined : t('auth.validation.passwordRequired'),
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setIsSubmitting(true);
    try {
      const tokens = await login({ email, password });
      useAuthStore.getState().login(tokens);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/todos';
      navigate(from, { replace: true });
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <p className="auth-form__server-error" role="alert">
          {serverError}
        </p>
      )}
      <div className="auth-form__field">
        <label htmlFor="login-email">{t('auth.login.emailLabel')}</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p className="auth-form__error" id="login-email-error">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div className="auth-form__field">
        <label htmlFor="login-password">{t('auth.login.passwordLabel')}</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
        />
        {fieldErrors.password && (
          <p className="auth-form__error" id="login-password-error">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
        {t('auth.login.submit')}
      </button>
      <p className="auth-form__link">
        <Link to="/signup">{t('auth.login.noAccount')}</Link>
      </p>
    </form>
  );
}
