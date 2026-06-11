import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS, type ActivityItem, type ProfileResponse } from '@/types';
import * as api from '@/api';
import { Link } from 'react-router-dom';
import { OrganizationDashboardPage } from './OrganizationDashboardPage';
import { PartnerDashboardPage } from './PartnerDashboardPage';
import { Icons } from '@/components/ui';

/**
 * Role-aware profile. Each role sees a different profile:
 *  - organization → organization profile/dashboard
 *  - partner      → partner profile/dashboard
 *  - volunteer/admin → personal profile (level, interests, activity)
 */
export function ProfilePage() {
  const { user } = useAuth();
  if (user?.role === 'organization') return <OrganizationDashboardPage />;
  if (user?.role === 'partner') return <PartnerDashboardPage />;
  return <VolunteerProfile />;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function VolunteerProfile() {
  const { t, i18n } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, a] = await Promise.all([api.getProfile(), api.getActivityFeed()]);
        setProfile(p);
        setActivities(a);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  useEffect(() => { refreshUser(); }, []);

  if (loading || !profile || !user) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  const pct = profile.experience_to_next > 0
    ? Math.min(100, Math.round((profile.experience / profile.experience_to_next) * 100))
    : 0;

  return (
    <div className="profile">
      {/* Header */}
      <div className="profile__header">
        <div className="profile__avatar">
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
        <div className="profile__info">
          <h1 className="profile__display-name">{profile.display_name}</h1>
          <div className="profile__username">@{profile.username}</div>
          <div className="profile__role">{ROLE_LABELS[profile.role]}</div>
        </div>
        <Link to="/profile/edit" className="btn btn--ghost btn--sm">{t('profile.edit')}</Link>
      </div>

      {/* Level */}
      <div className="profile__level-section">
        <div className="profile__level-header">
          <span className="profile__level-text">
            {t('profile.level')} <strong>{profile.level}</strong>
          </span>
          <span className="profile__xp-text">
            {t('profile.xp_format', { experience: profile.experience, experience_to_next: profile.experience_to_next })}
          </span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="profile__stats">
        <div className="stat-card">
          <div className="stat-card__value">{profile.level}</div>
          <div className="stat-card__label">{t('profile.level')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{profile.tokens_balance}</div>
          <div className="stat-card__label">{t('profile.tokens')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{activities.length}</div>
          <div className="stat-card__label">{t('profile.actions')}</div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="profile__bio">{profile.bio}</p>
      )}

      {/* Details — all available account data */}
      <h3 className="profile__section-title">{t('profile.details')}</h3>
      <div className="profile__details" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <DetailRow label={t('profile.email')} value={profile.email} />
        {profile.city && <DetailRow label={t('profile.fields.city')} value={profile.city} />}
        {profile.university && <DetailRow label={t('profile.fields.university')} value={profile.university} />}
        {profile.phone && <DetailRow label={t('profile.fields.phone')} value={profile.phone} />}
        {Object.entries(profile.social_links || {})
          .filter(([, v]) => v)
          .map(([key, val]) => (
            <DetailRow
              key={key}
              label={key}
              value={<a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{val}</a>}
            />
          ))}
        {profile.created_at && (
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {t('profile.member_since', { date: new Date(profile.created_at).toLocaleDateString(i18n.language) })}
          </div>
        )}
      </div>

      {/* Interests */}
      {profile.interests.length > 0 && (
        <>
          <h3 className="profile__section-title">{t('profile.interests')}</h3>
          <div className="profile__interests">
            {profile.interests.map((i) => (
              <span key={i} className="interest-tag">{i}</span>
            ))}
          </div>
        </>
      )}

      {/* Activity Feed */}
      <h3 className="profile__section-title">{t('profile.activity')}</h3>
      <div className="activity-feed">
        {activities.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{t('profile.no_activity')}</p>
        )}
        {activities.map((a) => (
          <div key={a.id} className="activity-item">
            <div className="activity-item__icon"><Icons.activity size={18} /></div>
            <div className="activity-item__body">
              <div className="activity-item__title">{a.title}</div>
              {a.description && <div className="activity-item__description">{a.description}</div>}
              <div className="activity-item__time">{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
