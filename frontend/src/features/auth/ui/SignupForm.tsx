import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/authApi';
import { validateEmail, validateName, validatePassword } from '../model/validation';
import './authForm.css';

interface FieldErrors {
  email?: string;
  password?: string;
  name?: string;
}

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errors: FieldErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      name: validateName(name) ?? undefined,
    };
    setFieldErrors(errors);
    if (errors.email || errors.password || errors.name) return;

    setIsSubmitting(true);
    try {
      await signup({ email, password, name });
      navigate('/login');
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
        <label htmlFor="signup-email">이메일</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p className="auth-form__error" id="signup-email-error">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div className="auth-form__field">
        <label htmlFor="signup-name">이름</label>
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
        />
        {fieldErrors.name && (
          <p className="auth-form__error" id="signup-name-error">
            {fieldErrors.name}
          </p>
        )}
      </div>
      <div className="auth-form__field">
        <label htmlFor="signup-password">비밀번호</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
        />
        {fieldErrors.password && (
          <p className="auth-form__error" id="signup-password-error">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
        가입하기
      </button>
      <p className="auth-form__link">
        <Link to="/login">이미 계정이 있으신가요? 로그인하기</Link>
      </p>
    </form>
  );
}
