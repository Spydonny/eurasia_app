import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import * as api from '@/api';
import { Button, Input, Icons } from '@/components/ui';

const INTEREST_OPTIONS = [
  'Environment', 'Education', 'Health', 'Animals',
  'Culture', 'Sports', 'Technology', 'Social',
];

const SOCIAL_KEYS = ['instagram', 'telegram', 'vk', 'linkedin'] as const;

export function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [university, setUniversity] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setDisplayName(p.display_name);
      setBio(p.bio);
      setPhone(p.phone || '');
      setCity(p.city || '');
      setUniversity(p.university || '');
      setSocialLinks(p.social_links || {});
      setInterests(p.interests);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const setSocial = (key: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanedSocial = Object.fromEntries(
        Object.entries(socialLinks).filter(([, v]) => v.trim()),
      );
      await api.updateProfile({
        display_name: displayName,
        bio,
        interests,
        phone: phone.trim(),
        city: city.trim(),
        university: university.trim(),
        social_links: cleanedSocial,
      });
      await refreshUser();
      navigate('/profile');
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  return (
    <div className="edit-profile">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}><Icons.back size={16} /> {t('common.back')}</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {t('profile.edit_page')}
        </h1>
      </div>

      <div className="edit-profile__avatar-section">
        <div className="edit-profile__avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="edit-profile__avatar-btn btn btn--ghost btn--sm">{t('profile.fields.change_photo')}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label={t('profile.fields.display_name')} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
        <Input label={t('profile.fields.bio')} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
        <Input label={t('profile.fields.phone')} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" />
        <Input label={t('profile.fields.city')} value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} autoComplete="address-level2" />
        <Input label={t('profile.fields.university')} value={university} onChange={(e) => setUniversity(e.target.value)} maxLength={150} />

        <div>
          <label className="input__label" style={{ marginBottom: 10, display: 'block' }}>{t('profile.fields.social_links')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SOCIAL_KEYS.map((key) => (
              <Input
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={socialLinks[key] || ''}
                onChange={(e) => setSocial(key, e.target.value)}
                placeholder="https://"
                maxLength={255}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="input__label" style={{ marginBottom: 10, display: 'block' }}>{t('profile.fields.interests')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className="interest-tag"
                style={{
                  background: interests.includes(interest) ? 'var(--color-primary)' : 'var(--color-primary-light)',
                  color: interests.includes(interest) ? 'white' : 'var(--color-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} loading={saving} style={{ width: '100%', marginTop: 8 }}>
          {t('profile.save')}
        </Button>
      </div>
    </div>
  );
}
