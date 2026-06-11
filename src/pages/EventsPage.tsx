import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Event } from '@/types';
import { hasMinRole } from '@/types';
import * as api from '@/api';
import { EventCard } from '@/components/events';
import { Icons } from '@/components/ui';

const CATEGORIES = [
  { value: '', labelKey: 'category.all' },
  { value: 'environment', labelKey: 'category.environment' },
  { value: 'education', labelKey: 'category.education' },
  { value: 'health', labelKey: 'category.health' },
  { value: 'animals', labelKey: 'category.animals' },
  { value: 'culture', labelKey: 'category.culture' },
  { value: 'sports', labelKey: 'category.sports' },
  { value: 'technology', labelKey: 'category.technology' },
  { value: 'social', labelKey: 'category.social' },
];

export function EventsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.listEvents({
          category: category || undefined,
          search: search || undefined,
          city: city || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          limit: 20,
        });
        setEvents(res.events);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [category, search, city, dateFrom, dateTo, page]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const canCreate = user ? hasMinRole(user.role, 'organization') : false;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="page__title">{t('events.title')}</h1>
        {canCreate && (
          <Link to="/events/create" className="btn btn--primary btn--sm">
            {t('events.create')}
          </Link>
        )}
      </div>
      <p className="page__subtitle">{t('events.subtitle')}</p>

      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          placeholder={t('events.search')}
          value={search}
          onChange={(e) => setParam('search', e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          className="input"
          placeholder={t('events.filter_city')}
          value={city}
          onChange={(e) => setParam('city', e.target.value)}
          style={{ flex: '1 1 140px' }}
        />
        <input
          className="input"
          type="date"
          title={t('events.filter_date_from')}
          value={dateFrom}
          onChange={(e) => setParam('date_from', e.target.value)}
          style={{ flex: '1 1 140px' }}
        />
        <input
          className="input"
          type="date"
          title={t('events.filter_date_to')}
          value={dateTo}
          onChange={(e) => setParam('date_to', e.target.value)}
          style={{ flex: '1 1 140px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setParam('category', c.value)}
            className={`event-filter-btn ${category === c.value ? 'event-filter-btn--active' : ''}`}
          >
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: 200 }}>{t('common.loading')}</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <Icons.empty className="empty-state__icon" size={32} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{t('events.empty')}</p>
          <p className="empty-state__text">{t('events.empty_hint')}</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--ghost btn--sm"
            disabled={page <= 1}
            onClick={() => setParam('page', String(page - 1))}
          >
            <Icons.back size={16} /> {t('common.prev')}
          </button>
          <span className="pagination__info">
            {t('common.page_info', { page, totalPages, total })}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            disabled={page >= totalPages}
            onClick={() => setParam('page', String(page + 1))}
          >
            {t('common.next')} <Icons.next size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
