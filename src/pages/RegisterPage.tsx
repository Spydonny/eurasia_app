import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterableRole } from '@/types';
import { getHomePathForRole } from '@/config/navigation';
import * as api from '@/api';
import { Button, Input, Card, Icons, type IconType } from '@/components/ui';

const REGISTER_ROLES: { value: RegisterableRole; labelKey: string; icon: IconType }[] = [
  { value: 'volunteer', labelKey: 'auth.role_volunteer', icon: Icons.profile },
  { value: 'organization', labelKey: 'auth.role_organization', icon: Icons.organization },
  { value: 'partner', labelKey: 'auth.role_partner', icon: Icons.partner },
];

const INTEREST_OPTIONS = [
  'environment', 'education', 'health', 'animals',
  'culture', 'sports', 'technology', 'social',
];

const SUBTITLE_KEYS: Record<RegisterableRole, string> = {
  volunteer: 'auth.join_community',
  organization: 'auth.register_subtitle_organization',
  partner: 'auth.register_subtitle_partner',
};

export function RegisterPage() {
  const { t } = useTranslation();
  const { register, registerOrganization, registerPartner } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<RegisterableRole>('volunteer');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth.passwords_mismatch'));
      return;
    }
    if (role === 'organization' && (!orgName.trim() || !orgDescription.trim())) {
      setError(t('auth.org_fields_required'));
      return;
    }
    if (role === 'partner' && (!brandName.trim() || !brandDescription.trim())) {
      setError(t('auth.partner_fields_required'));
      return;
    }

    setLoading(true);
    try {
      if (role === 'volunteer') {
        await register(email, username, password, role);
        try {
          await api.updateProfile({
            display_name: username,
            city: city.trim() || undefined,
            interests: interests.length > 0 ? interests : undefined,
          });
        } catch { /* profile update is optional */ }
        navigate('/onboarding', { replace: true });
      } else if (role === 'organization') {
        await registerOrganization({
          email,
          username,
          password,
          name: orgName.trim(),
          description: orgDescription.trim(),
          contact_phone: contactPhone.trim(),
          city: city.trim(),
          website: website.trim(),
        });
        navigate(getHomePathForRole(role), { replace: true });
      } else {
        await registerPartner({
          email,
          username,
          password,
          brand_name: brandName.trim(),
          description: brandDescription.trim(),
          city: city.trim(),
        });
        navigate(getHomePathForRole(role), { replace: true });
      }
    } catch {
      setError(t('auth.registration_failed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Card className="auth-form">
        <div className="auth-form__header">
          <h1 className="auth-form__title">{t('auth.create_account')}</h1>
          <p className="auth-form__subtitle">{t(SUBTITLE_KEYS[role])}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert--error">{error}</div>}

          <div className="input__wrapper">
            <label className="input__label">{t('auth.select_role')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {REGISTER_ROLES.map((r) => {
                const RoleIcon = r.icon;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`event-filter-btn ${role === r.value ? 'event-filter-btn--active' : ''}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <RoleIcon size={16} /> {t(r.labelKey)}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
              {t(`auth.role_hint_${role}`)}
            </p>
          </div>

          {role === 'volunteer' && (
            <>
              <Input
                label={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label={t('org.city')}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
              <div className="input__wrapper">
                <label className="input__label">{t('auth.interests')}</label>
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
                      }}
                    >
                      {t(`category.${interest}`)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {role === 'organization' && (
            <>
              <Input
                label={t('org.name')}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
              <Input
                label={t('org.description')}
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                required
              />
              <Input
                label={t('auth.contact_person')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label={t('org.phone')}
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                autoComplete="tel"
              />
              <Input
                label={t('org.city')}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
              <Input
                label={t('org.website')}
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </>
          )}

          {role === 'partner' && (
            <>
              <Input
                label={t('partner.brand_name')}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
              <Input
                label={t('partner.description')}
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                required
              />
              <Input
                label={t('auth.contact_person')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
              <Input
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label={t('org.city')}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
            </>
          )}

          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label={t('auth.confirm_password')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="auth-form__submit">
            {t('auth.sign_up')}
          </Button>

          <p className="auth-form__footer">
            {t('auth.already_have_account')} <Link to="/login">{t('auth.sign_in')}</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
