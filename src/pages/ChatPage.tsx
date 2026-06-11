import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getChatRooms, getDialogs } from '@/api';
import type { ChatRoom as ChatRoomType, PrivateDialog } from '@/types';
import { Icons } from '@/components/ui';

type Tab = 'chats' | 'messages';

export function ChatPage({ initialTab = 'chats' }: { initialTab?: Tab }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>(initialTab);

  const [rooms, setRooms] = useState<ChatRoomType[]>([]);
  const [dialogs, setDialogs] = useState<PrivateDialog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const fetcher = tab === 'chats' ? getChatRooms() : getDialogs();
    fetcher
      .then((data: any) => {
        if (cancelled) return;
        if (tab === 'chats') setRooms(data);
        else setDialogs(data);
      })
      .catch(() => { if (!cancelled) { if (tab === 'chats') setError(t('chat_page.load_error')); else setDialogs([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, t]);

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

      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`filter-tab ${tab === 'chats' ? 'filter-tab--active' : ''}`}
          onClick={() => setTab('chats')}
        >
          {t('chat.tab_event_chats')}
        </button>
        <button
          className={`filter-tab ${tab === 'messages' ? 'filter-tab--active' : ''}`}
          onClick={() => setTab('messages')}
        >
          {t('chat.tab_direct_messages')}
        </button>
      </div>

      {loading && <div className="page-loader">{t('common.loading')}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {/* Event chats */}
      {!loading && tab === 'chats' && (
        rooms.length === 0 ? (
          <div className="empty-state">
            <Icons.conversation className="empty-state__icon" size={32} />
            <p className="empty-state__text">{t('chat.empty')}</p>
            <Link to="/events" className="btn btn--primary">{t('chat.browse_events')}</Link>
          </div>
        ) : (
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
        )
      )}

      {/* Private messages */}
      {!loading && tab === 'messages' && (
        dialogs.length === 0 ? (
          <div className="empty-state">
            <Icons.conversation className="empty-state__icon" size={32} />
            <p className="empty-state__text">{t('messages.empty')}</p>
            <Link to="/friends" className="btn btn--primary btn--sm" style={{ marginTop: 8 }}>
              {t('friends.title')}
            </Link>
          </div>
        ) : (
          dialogs.map((d) => {
            const name = d.other_user?.display_name || d.other_user?.username || '?';
            return (
              <Link key={d.id} to={`/messages/${d.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="user-row">
                  <div className="user-row__main">
                    <div className="user-row__avatar">
                      {d.other_user?.avatar_url ? (
                        <img src={d.other_user.avatar_url} alt="" />
                      ) : (
                        name[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <div className="user-row__name">{name}</div>
                      <div className="user-row__meta">
                        {d.last_message_content || t('chat.no_messages_yet')}
                      </div>
                    </div>
                  </div>
                  <div className="user-row__actions">
                    {d.unread_count > 0 && (
                      <span style={{
                        background: 'var(--color-primary)',
                        color: '#fff',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 8px',
                      }}>{d.unread_count}</span>
                    )}
                    {d.last_message_at && (
                      <span className="user-row__meta">
                        {new Date(d.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )
      )}
    </div>
  );
}
