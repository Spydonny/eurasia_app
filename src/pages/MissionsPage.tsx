import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getMissions, getMyMissionSubmissions } from '@/api';
import { MissionCard } from '@/components/missions';
import type { MissionWithProgress, MissionSubmission } from '@/types';
import { Icons } from '@/components/ui';

export function MissionsPage() {
  const { t } = useTranslation();
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, MissionSubmission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const load = useCallback(async () => {
    try {
      const [data, subs] = await Promise.all([getMissions(), getMyMissionSubmissions().catch(() => ({ items: [], total: 0 }))]);
      setMissions(data);
      // Keep the most recent submission per mission.
      const map: Record<string, MissionSubmission> = {};
      for (const s of subs.items) {
        const prev = map[s.mission_id];
        if (!prev || s.created_at > prev.created_at) map[s.mission_id] = s;
      }
      setSubmissions(map);
    } catch {
      setError(t('missions.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const filtered = missions.filter((m) => {
    if (filter === 'done') return m.progress?.is_completed;
    if (filter === 'active') return !m.progress?.is_completed;
    return true;
  });

  const doneCount = missions.filter((m) => m.progress?.is_completed).length;

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;

  return (
    <div className="page">
      <h1 className="page__title">{t('missions.title')}</h1>
      <p className="page__subtitle">
        {t('missions.subtitle')}
      </p>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-card__value">{missions.length}</div>
          <div className="stat-card__label">{t('missions.total')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{doneCount}</div>
          <div className="stat-card__label">{t('missions.completed')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{missions.length - doneCount}</div>
          <div className="stat-card__label">{t('missions.active')}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? t('missions.filter_all') : f === 'active' ? t('missions.filter_in_progress') : t('missions.filter_done')}
          </button>
        ))}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {!error && filtered.length === 0 && (
        <div className="empty-state">
          <Icons.mission className="empty-state__icon" size={32} />
          <p className="empty-state__text">
            {filter === 'done'
              ? t('missions.empty_done')
              : filter === 'active'
                ? t('missions.empty_active')
                : t('missions.empty_all')}
          </p>
        </div>
      )}

      <div className="missions-list">
        {filtered.map((m) => (
          <MissionCard
            key={m.mission.id}
            data={m}
            submission={submissions[m.mission.id]}
            onSubmitted={load}
          />
        ))}
      </div>
    </div>
  );
}
