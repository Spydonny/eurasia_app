import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '@/api';
import type { LeaderboardEntry } from '@/types';
import { Icons } from '@/components/ui';

const PAGE_SIZE = 50;

export function LeaderboardPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState('all_time');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const periods = [
    { key: 'weekly', labelKey: 'leaderboard.week' },
    { key: 'monthly', labelKey: 'leaderboard.month' },
    { key: 'all_time', labelKey: 'leaderboard.all_time' },
  ];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLeaderboard(period, undefined, page, PAGE_SIZE);
      setEntries(res.entries || []);
      setTotal(res.total || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [period, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const rankColor = (rank: number) => {
    if (rank === 1) return 'var(--primary)';
    if (rank <= 3) return 'var(--text-2)';
    return 'var(--text-3)';
  };

  return (
    <div className="page">
      <h1 className="page__title">{t('leaderboard.title')}</h1>

      <div className="filter-tabs" style={{ margin: '16px 0' }}>
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => { setPeriod(p.key); setPage(1); }}
            className={`filter-tab ${period === p.key ? 'filter-tab--active' : ''}`}
          >
            {t(p.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader">{t('common.loading')}</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <Icons.ranking className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('leaderboard.empty')}</p>
        </div>
      ) : (
        <>
          {entries.map(entry => (
            <div key={entry.id} className="user-row">
              <div className="user-row__main">
                <span className="user-row__rank" style={{ color: rankColor(entry.rank) }}>
                  {entry.rank <= 3 ? <Icons.ranking size={18} weight="fill" /> : `#${entry.rank}`}
                </span>
                <div className="user-row__avatar">
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="" />
                  ) : (
                    (entry.display_name || entry.username)?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div>
                  <div className="user-row__name">{entry.display_name || entry.username}</div>
                  <div className="user-row__meta">
                    {entry.city && `${entry.city} · `}
                    {t('leaderboard.xp_format', { xp: entry.xp_total })} · {t('leaderboard.tokens_format', { tokens: entry.tokens_total })}
                  </div>
                </div>
              </div>
              <div className="user-row__meta" style={{ textAlign: 'right' }}>
                <div>{t('leaderboard.events_count', { count: entry.events_attended })}</div>
                <div>{t('leaderboard.missions_count', { count: entry.missions_completed })}</div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn--ghost btn--sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <Icons.back size={16} /> {t('leaderboard.previous')}
              </button>
              <span className="pagination__info">
                {t('leaderboard.page_of', { page, total: totalPages })}
              </span>
              <button
                className="btn btn--ghost btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                {t('leaderboard.next')} <Icons.next size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
