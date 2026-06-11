import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDialogs } from '@/api';
import type { PrivateDialog } from '@/types';
import { Icons } from '@/components/ui';

export function MessagesPage() {
  const { t } = useTranslation();
  const [dialogs, setDialogs] = useState<PrivateDialog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDialogs()
      .then(setDialogs)
      .catch(() => setDialogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1 className="page__title">{t('messages.title')}</h1>
      <p className="page__subtitle">{t('messages.subtitle')}</p>

      {dialogs.length === 0 ? (
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
      )}
    </div>
  );
}
