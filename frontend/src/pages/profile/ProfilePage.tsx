import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../../entities/user/model/useMe';
import ProfileForm from '../../features/user-profile/ui/ProfileForm';
import './profile-page.css';

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleSaved() {
    setToast('저장되었습니다.');
    setTimeout(() => navigate('/todos'), 1000);
  }

  if (isLoading) return <div className="profile-page">불러오는 중...</div>;
  if (!user) return <div className="profile-page">내 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="profile-page">
      <div className="profile-page__card">
        <h2>내 정보 수정</h2>
        <ProfileForm user={user} onSaved={handleSaved} />
        {toast && <p className="profile-page__toast" role="status">{toast}</p>}
      </div>
    </div>
  );
}
