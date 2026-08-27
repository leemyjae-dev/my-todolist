import SignupForm from '../../features/auth/ui/SignupForm';
import '../authCard.css';

export default function SignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-card__brand">my-todoList</p>
        <h2 className="auth-card__title">회원가입</h2>
        <SignupForm />
      </div>
    </div>
  );
}
