import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyAchievements, getMyBadges } from '@/api';
import type { UserAchievement, UserBadge } from '@/types';
import { Icons } from '@/components/ui';

export function AchievementsPage() {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges'>('achievements');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [ach, b] = await Promise.all([getMyAchievements(), getMyBadges()]);
      setAchievements(ach);
      setBadges(b);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1 className="page__title">{t('achievements.title')}</h1>

      <div className="filter-tabs" style={{ margin: '16px 0' }}>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`filter-tab ${activeTab === 'achievements' ? 'filter-tab--active' : ''}`}
        >
          {t('achievements.tab_achievements', { count: achievements.length })}
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`filter-tab ${activeTab === 'badges' ? 'filter-tab--active' : ''}`}
        >
          {t('achievements.tab_badges', { count: badges.length })}
        </button>
      </div>

      {activeTab === 'achievements' && (
        achievements.length === 0 ? (
          <div className="empty-state">
            <Icons.achievement className="empty-state__icon" size={32} />
            <p className="empty-state__text">{t('achievements.empty_achievements')}</p>
          </div>
        ) : (
          <div className="achievements-grid">
            {achievements.map(ach => (
              <div key={ach.id} className="achievement-card">
                <span className="achievement-card__icon"><Icons.achievement size={24} /></span>
                <div>
                  <div className="achievement-card__title">{ach.title}</div>
                  <div className="achievement-card__desc">{ach.description}</div>
                  <div className="achievement-card__meta">
                    {ach.xp_reward > 0 && <span>{t('achievements.xp_reward', { xp: ach.xp_reward })}</span>}
                    {ach.tokens_reward > 0 && <span>{t('achievements.tokens_reward', { tokens: ach.tokens_reward })}</span>}
                    <span>{new Date(ach.unlocked_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'badges' && (
        badges.length === 0 ? (
          <div className="empty-state">
            <Icons.badge className="empty-state__icon" size={32} />
            <p className="empty-state__text">{t('achievements.empty_badges')}</p>
          </div>
        ) : (
          <div className="achievements-grid">
            {badges.map(badge => (
              <div key={badge.id} className="achievement-card">
                <span className="achievement-card__icon"><Icons.badge size={24} /></span>
                <div>
                  <div className="achievement-card__title">{badge.label}</div>
                  <div className="achievement-card__desc">{badge.description}</div>
                  <div className="achievement-card__meta">
                    <span>{new Date(badge.earned_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
