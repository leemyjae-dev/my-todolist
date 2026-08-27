import LoginForm from '../../features/auth/ui/LoginForm';
import '../authCard.css';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-card__brand">my-todoList</p>
        <h2 className="auth-card__title">로그인</h2>
        <LoginForm />
      </div>
    </div>
  );
}
