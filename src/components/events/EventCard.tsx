import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Event } from '@/types';
import { CategoryIcons, Icons } from '@/components/ui';

export function EventCard({ event }: { event: Event }) {
  const { t, i18n } = useTranslation();
  const date = new Date(event.start_date);
  const formattedDate = date.toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const CategoryIcon = CategoryIcons[event.category] || CategoryIcons.other;

  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="event-card">
        <div
          className={`event-card__status ${
            event.status === 'published'
              ? 'event-card__status--published'
              : event.status === 'in_progress'
                ? 'event-card__status--active'
                : event.status === 'cancelled'
                  ? 'event-card__status--cancelled'
                  : 'event-card__status--draft'
          }`}
        >
          {t(`event_card.status.${event.status}`, event.status.replace('_', ' '))}
        </div>

        <div className="event-card__header">
          <div className="event-card__icon"><CategoryIcon size={24} /></div>
          <div className="event-card__meta">
            <div className="event-card__date">{formattedDate}</div>
            <div className="event-card__category">{t(`category.${event.category}`)}</div>
          </div>
        </div>

        <h3 className="event-card__title">{event.title}</h3>

        {event.short_description && (
          <p className="event-card__desc">{event.short_description}</p>
        )}

        <div className="event-card__footer">
          <div className="event-card__creator">{t('event_card.by', { creator: event.creator_name })}</div>
          <div className="event-card__participants">
            <Icons.participants size={14} />
            <span>
              {event.participant_count}
              {event.max_participants > 0 ? `/${event.max_participants}` : ''}
            </span>
          </div>
        </div>

        {event.is_joined && (
          <div className="event-card__joined-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icons.success size={14} /> {t('event_card.joined')}
          </div>
        )}
      </div>
    </Link>
  );
}
