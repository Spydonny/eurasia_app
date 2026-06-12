import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Event, EventParticipant } from '@/types';
import { hasMinRole } from '@/types';
import * as api from '@/api';
import { CategoryIcons, Icons, TranslatableText } from '@/components/ui';
import { QRCodeModal, QRScannerModal } from '@/components/events';

export function EventDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [manageMsg, setManageMsg] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const e = await api.getEvent(id);
      setEvent(e);
      const canManage = user && (user.id === e.created_by || user.role === 'admin' || hasMinRole(user.role, 'organization'));
      if (canManage) {
        try {
          const p = await api.getEventParticipants(id);
          setParticipants(p);
        } catch {
          setParticipants([]);
        }
      }
    } catch {
      navigate('/events', { replace: true });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user?.id]);

  const handleConfirm = async (userId: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.confirmParticipation(id, userId);
      setManageMsg(res.message);
      await load();
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleJoin = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.joinEvent(id);
      await load();
      await refreshUser();
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.leaveEvent(id);
      await load();
      await refreshUser();
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handlePublish = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.publishEvent(id);
      setManageMsg(res.message);
      await load();
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm(t('events.delete_confirm'))) return;
    try {
      await api.deleteEvent(id);
      navigate('/events', { replace: true });
    } catch { /* ignore */ }
  };

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;
  if (!event) return null;

  const CategoryIcon = CategoryIcons[event.category] || CategoryIcons.other;
  const startDate = new Date(event.start_date).toLocaleDateString(
    i18n.language === 'kk' ? 'kk-KZ' : 'ru-RU',
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  );
  const startTime = new Date(event.start_date).toLocaleTimeString(
    i18n.language === 'kk' ? 'kk-KZ' : 'ru-RU',
    { hour: '2-digit', minute: '2-digit' },
  );

  const isOwner = user?.id === event.created_by || user?.role === 'admin' || (user && hasMinRole(user.role, 'organization'));
  const canJoin = !event.is_joined && !event.is_full && event.status !== 'cancelled' && event.status !== 'completed';
  const canLeave = event.is_joined && event.status !== 'completed' && event.status !== 'cancelled';

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/events')}>
          <Icons.back size={16} /> {t('common.back')}
        </button>
        {isOwner && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {(event.status === 'draft' || event.status === 'rejected') && (
              <button className="btn btn--primary btn--sm" onClick={handlePublish} disabled={actionLoading}>
                {actionLoading ? '...' : t('events.detail.submit_review')}
              </button>
            )}
            <Link to={`/events/${event.id}/edit`} className="btn btn--ghost btn--sm">{t('common.edit')}</Link>
            <button className="btn btn--ghost btn--sm" onClick={handleDelete} style={{ color: 'var(--color-primary)' }}>
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>

      <div className="event-detail">
        <div className="event-detail__icon"><CategoryIcon size={40} /></div>
        <div className="event-detail__status">{t(`events.status.${event.status}`)}</div>

        {isOwner && event.status === 'pending_review' && (
          <div className="alert" style={{ marginBottom: 16 }}>{t('events.detail.pending_review_note')}</div>
        )}

        <h1 className="event-detail__title"><TranslatableText as="span" text={event.title} /></h1>
        <p className="event-detail__creator">{t('events.detail.by', { creator: event.creator_name })}</p>

        <div className="event-detail__info-grid">
          <div className="event-detail__info-item">
            <div className="event-detail__info-label">{t('events.detail.date')}</div>
            <div className="event-detail__info-value">{startDate}</div>
          </div>
          <div className="event-detail__info-item">
            <div className="event-detail__info-label">{t('events.detail.time')}</div>
            <div className="event-detail__info-value">{startTime}</div>
          </div>
          <div className="event-detail__info-item">
            <div className="event-detail__info-label">{t('events.detail.category')}</div>
            <div className="event-detail__info-value">{t(`category.${event.category}`)}</div>
          </div>
          <div className="event-detail__info-item">
            <div className="event-detail__info-label">{t('events.detail.participants')}</div>
            <div className="event-detail__info-value">
              {event.participant_count}
              {event.max_participants > 0 ? ` / ${event.max_participants}` : ''}
            </div>
          </div>
        </div>

        {event.location.city && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {t('events.detail.location')}
            </div>
            <div style={{ fontWeight: 500 }}>
              {[event.location.venue, event.location.city, event.location.country].filter(Boolean).join(', ')}
            </div>
            {event.location.type === 'online' && (
              <div style={{ fontSize: 14, color: 'var(--color-secondary)', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icons.online size={14} /> {t('events.detail.online_event')}</div>
            )}
          </div>
        )}

        <div className="event-detail__section">
          <h3 className="event-detail__section-title">{t('events.detail.about')}</h3>
          <TranslatableText as="p" className="event-detail__description" text={event.description} />
        </div>

        {event.tags.length > 0 && (
          <div className="event-detail__section">
            <h3 className="event-detail__section-title">{t('events.detail.tags')}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {event.tags.map((t) => (
                <span key={t} className="interest-tag">{t}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {canJoin && (
            <button className="btn btn--primary btn--lg" onClick={handleJoin} disabled={actionLoading} style={{ flex: 1 }}>
              {actionLoading ? `${t('events.detail.joining')}` : t('events.detail.join')}
            </button>
          )}
          {canLeave && (
            <button className="btn btn--secondary btn--lg" onClick={handleLeave} disabled={actionLoading} style={{ flex: 1 }}>
              {actionLoading ? `${t('events.detail.leaving')}` : t('events.detail.leave')}
            </button>
          )}
          {event.is_joined && (
            <div className="event-detail__joined-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><Icons.success size={16} /> {t('events.detail.registered')}</div>
          )}
          {event.is_full && !event.is_joined && (
            <div className="alert alert--error" style={{ width: '100%', textAlign: 'center' }}>
              {t('events.detail.full')}
            </div>
          )}
        </div>

        {event.is_joined && (
          <Link
            to={`/chat/event/${event.id}`}
            className="btn btn--primary"
            style={{ marginTop: 16, width: '100%' }}
          >
            <Icons.conversation size={16} /> {t('events.detail.event_chat')}
          </Link>
        )}

        {event.is_joined && !isOwner && (
          <button
            className="btn btn--ghost"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => setShowQr(true)}
          >
            <Icons.online size={16} /> {t('events.qr.show_my')}
          </button>
        )}

        {isOwner && participants.length > 0 && (
          <div className="event-detail__section" style={{ marginTop: 24 }}>
            <div className="event-detail__manage-header">
              <h3 className="event-detail__section-title" style={{ marginBottom: 0 }}>{t('events.detail.manage_participants')}</h3>
              <button className="btn btn--primary btn--sm" onClick={() => setShowScanner(true)}>
                <Icons.online size={16} /> {t('events.qr.scan')}
              </button>
            </div>
            {manageMsg && <div className="alert alert--success">{manageMsg}</div>}
            <div className="token-history">
              {participants.map((p) => (
                <div key={p.user_id} className="token-row">
                  <div className="token-row__info">
                    <span className="token-row__type">{p.display_name || p.username || p.user_id}</span>
                    <span className="token-row__desc">
                      {p.confirmed ? t('events.detail.confirmed') : t('events.detail.pending')}
                    </span>
                  </div>
                  {!p.confirmed && (
                    <button
                      className="btn btn--primary btn--sm"
                      disabled={actionLoading}
                      onClick={() => handleConfirm(p.user_id)}
                    >
                      {t('events.detail.confirm')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showQr && id && <QRCodeModal eventId={id} onClose={() => setShowQr(false)} />}
      {showScanner && id && (
        <QRScannerModal
          eventId={id}
          onClose={() => setShowScanner(false)}
          onVerified={() => { void load(); }}
        />
      )}
    </div>
  );
}
