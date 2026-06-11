import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { TokenWidget, Icons, RoleIcons, type IconType } from '@/components/ui';
import { ROLE_LABELS } from '@/types';
import type { ActivityItem } from '@/types';
import { Link } from 'react-router-dom';
import * as api from '@/api';

export function DashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    api.getActivityFeed(10).then(setActivities).catch(() => setActivities([]));
  }, []);

  if (!user) return null;

  return (
    <div className="page">
      <HeroSection user={user} />
      <StatsRow user={user} />
      <QuickActions role={user.role} />
      <ActivitySection activities={activities} />
    </div>
  );
}

function HeroSection({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const { t } = useTranslation();
  return (
    <div className="hero">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <h1 className="hero__title">{t('dashboard.hero_title', { username: user.username })}</h1>
          <p className="hero__subtitle">{ROLE_LABELS[user.role]} · Level {user.level ?? 1}</p>
        </div>
        <TokenWidget />
      </div>
    </div>
  );
}

function StatsRow({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const { t } = useTranslation();
  return (
    <div className="profile__stats">
      <div className="stat-card">
        <div className="stat-card__value">{user.level ?? 1}</div>
        <div className="stat-card__label">{t('dashboard.level')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__value">{user.tokens_balance ?? 0}</div>
        <div className="stat-card__label">{t('dashboard.tokens')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__value">
          {(() => { const RoleIcon = RoleIcons[user.role] || Icons.profile; return <RoleIcon size={22} />; })()}
        </div>
        <div className="stat-card__label">{ROLE_LABELS[user.role]}</div>
      </div>
    </div>
  );
}

const ROLE_ACTIONS: Record<string, { labelKey: string; path: string; icon: IconType }[]> = {
  volunteer: [
    { labelKey: 'dashboard.find_events', path: '/events', icon: Icons.navEvents },
    { labelKey: 'dashboard.my_tokens', path: '/tokens', icon: Icons.balance },
    { labelKey: 'nav.rewards', path: '/rewards', icon: Icons.redeem },
  ],
  organization: [
    { labelKey: 'nav.events', path: '/events', icon: Icons.navEvents },
    { labelKey: 'nav.organization', path: '/profile', icon: Icons.organization },
    { labelKey: 'events.create', path: '/events/create', icon: Icons.eventCreate },
  ],
  partner: [
    { labelKey: 'nav.partner', path: '/profile', icon: Icons.partner },
    { labelKey: 'nav.rewards', path: '/rewards', icon: Icons.redeem },
    { labelKey: 'dashboard.profile', path: '/profile', icon: Icons.profile },
  ],
  admin: [
    { labelKey: 'nav.admin', path: '/admin', icon: Icons.admin },
    { labelKey: 'nav.events', path: '/events', icon: Icons.navEvents },
    { labelKey: 'nav.tokens', path: '/tokens', icon: Icons.balance },
  ],
};

function QuickActions({ role }: { role: string }) {
  const { t } = useTranslation();
  const actions = ROLE_ACTIONS[role] || ROLE_ACTIONS.volunteer;

  return (
    <div className="quick-actions">
      {actions.map((a) => {
        const ActionIcon = a.icon;
        return (
          <Link key={a.path} to={a.path} className="quick-action">
            <span className="quick-action__icon"><ActionIcon size={22} /></span>
            <span className="quick-action__label">{t(a.labelKey)}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ActivitySection({ activities }: { activities: ActivityItem[] }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="profile__section-title">{t('dashboard.recent_activity')}</h3>
      <div className="activity-feed">
        {activities.length === 0 ? (
          <>
            <div className="activity-item">
              <div className="activity-item__icon"><Icons.celebrate size={18} /></div>
              <div className="activity-item__body">
                <div className="activity-item__title">{t('dashboard.welcome_feed_title')}</div>
                <div className="activity-item__description">{t('dashboard.welcome_feed_desc')}</div>
                <div className="activity-item__time">{t('dashboard.just_now')}</div>
              </div>
            </div>
          </>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-item__icon"><Icons.activity size={18} /></div>
              <div className="activity-item__body">
                <div className="activity-item__title">{item.title}</div>
                <div className="activity-item__description">{item.description}</div>
                <div className="activity-item__time">{new Date(item.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
