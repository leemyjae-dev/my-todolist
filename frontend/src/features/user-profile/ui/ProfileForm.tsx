import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateMe } from '../model/useUpdateMe';
import { useT } from '../../../shared/lib/i18n/useT';
import type { User } from '../../auth/api/authApi';
import './profile-form.css';

interface ProfileFormProps {
  user: User;
  onSaved: () => void;
}

export default function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const t = useT();
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const updateMe = useUpdateMe();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (password && password.length < 8) {
      setFieldError(t('auth.validation.passwordTooShort'));
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
        <label htmlFor="profile-email">{t('profile.emailLabel')}</label>
        <input id="profile-email" value={user.email} readOnly disabled />
      </div>

      <div className="profile-form__field">
        <label htmlFor="profile-name">{t('profile.nameLabel')}</label>
        <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="profile-form__field">
        <label htmlFor="profile-password">{t('profile.passwordLabel')}</label>
        <input
          id="profile-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="profile-form__hint">{t('profile.passwordHint')}</p>
      </div>

      <div className="profile-form__actions">
        <button type="button" onClick={() => navigate('/todos')}>{t('common.cancel')}</button>
        <button type="submit" disabled={updateMe.isPending}>{t('common.save')}</button>
      </div>
    </form>
  );
}
