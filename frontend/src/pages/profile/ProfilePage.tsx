import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../../entities/user/model/useMe';
import ProfileForm from '../../features/user-profile/ui/ProfileForm';
import { useT } from '../../shared/lib/i18n/useT';
import './profile-page.css';

export default function ProfilePage() {
  const t = useT();
  const { data: user, isLoading } = useMe();
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleSaved() {
    setToast(t('profile.saved'));
    setTimeout(() => navigate('/todos'), 1000);
  }

  if (isLoading) return <div className="profile-page">{t('common.loading')}</div>;
  if (!user) return <div className="profile-page">{t('profile.loadFailed')}</div>;

  return (
    <div className="profile-page">
      <div className="profile-page__card">
        <h2>{t('profile.title')}</h2>
        <ProfileForm user={user} onSaved={handleSaved} />
        {toast && <p className="profile-page__toast" role="status">{toast}</p>}
      </div>
    </div>
  );
}
