import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateMe } from '../model/useUpdateMe';
import type { User } from '../../auth/api/authApi';
import './profile-form.css';

interface ProfileFormProps {
  user: User;
  onSaved: () => void;
}

export default function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const updateMe = useUpdateMe();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (password && password.length < 8) {
      setFieldError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      await updateMe.mutateAsync({ name, ...(password ? { password } : {}) });
      onSaved();
    } catch (err) {
      setFieldError((err as Error).message);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      {fieldError && <p className="profile-form__error" role="alert">{fieldError}</p>}

      <div className="profile-form__field">
        <label htmlFor="profile-email">이메일</label>
        <input id="profile-email" value={user.email} readOnly disabled />
      </div>

      <div className="profile-form__field">
        <label htmlFor="profile-name">이름</label>
        <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="profile-form__field">
        <label htmlFor="profile-password">새 비밀번호</label>
        <input
          id="profile-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="profile-form__hint">변경하지 않으려면 비워두세요.</p>
      </div>

      <div className="profile-form__actions">
        <button type="button" onClick={() => navigate('/todos')}>취소</button>
        <button type="submit" disabled={updateMe.isPending}>저장</button>
      </div>
    </form>
  );
}
