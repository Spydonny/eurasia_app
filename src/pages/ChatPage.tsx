import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getChatRooms } from '@/api';
import type { ChatRoom as ChatRoomType } from '@/types';
import { Icons } from '@/components/ui';

export function ChatPage() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getChatRooms();
        if (!cancelled) setRooms(data);
      } catch {
        if (!cancelled) setError(t('chat_page.load_error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [t]);

  if (loading) return <div className="page-loader">{t('chat_page.loading')}</div>;

  function timeAgo(iso: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('chat.time_just_now');
    if (mins < 60) return t('chat.time_minutes', { m: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('chat.time_hours', { h: hours });
    const days = Math.floor(hours / 24);
    return t('chat.time_days', { d: days });
  }

  return (
    <div className="page">
      <h1 className="page__title">{t('chat.title')}</h1>
      <p className="page__subtitle">{t('chat.subtitle')}</p>

      {error && <div className="alert alert--error">{error}</div>}

      {!error && rooms.length === 0 && (
        <div className="empty-state">
          <Icons.conversation className="empty-state__icon" size={32} />
          <p className="empty-state__text">
            {t('chat.empty')}
          </p>
          <Link to="/events" className="btn btn--primary">{t('chat.browse_events')}</Link>
        </div>
      )}

      <div className="chat-list">
        {rooms.map((room) => (
          <Link key={room.id} to={`/chat/event/${room.event_id}`} className="chat-list__item">
            <div className="chat-list__avatar">
              {room.event_id ? <Icons.eventDetail size={20} /> : <Icons.conversation size={20} />}
            </div>
            <div className="chat-list__info">
              <div className="chat-list__name">{room.name}</div>
              <div className="chat-list__preview">
                {room.last_message_content || t('chat.no_messages_yet')}
              </div>
            </div>
            <div className="chat-list__meta">
              <span className="chat-list__time">{timeAgo(room.last_message_at)}</span>
              <span className="chat-list__count">{t('chat.members', { count: room.member_count })}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
