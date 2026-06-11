import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/api';
import type { Notification } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationStateIcon } from '@/components/notifications';
import { Icons } from '@/components/ui';

export function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { refreshCount } = useNotifications();

  async function load() {
    setLoading(true);
    try {
      const data = await listNotifications(100, 0, filter === 'unread');
      setNotifications(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      refreshCount();
    } catch { /* ignore */ }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      refreshCount();
    } catch { /* ignore */ }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">{t('notifications.title')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={handleMarkAllRead}>
            {t('notifications.mark_all_read')}
          </button>
        </div>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('all')}
        >{t('notifications.filter_all')}</button>
        <button
          className={`filter-tab ${filter === 'unread' ? 'filter-tab--active' : ''}`}
          onClick={() => setFilter('unread')}
        >{t('notifications.filter_unread')}</button>
      </div>

      {loading ? <div className="page-loader">{t('common.loading')}</div> : (
        <div className="notifications-list">
          {notifications.length === 0 && (
            <div className="empty-state">
              <Icons.empty className="empty-state__icon" size={32} />
              <p className="empty-state__text">
                {filter === 'unread' ? t('notifications.empty_unread') : t('notifications.empty_all')}
              </p>
            </div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.read ? '' : 'notification-card--unread'}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              {(() => {
                const Icon = notificationStateIcon(n.type);
                return (
                  <span className="notification-card__icon">
                    <Icon size={20} />
                  </span>
                );
              })()}
              <div className="notification-card__body">
                <div className="notification-card__title">{n.title}</div>
                <div className="notification-card__message">{n.message}</div>
                <div className="notification-card__meta">
                  <span className="notification-card__time">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  {n.reference_type && (
                    <span className="notification-card__ref">
                      {n.reference_type}
                    </span>
                  )}
                </div>
              </div>
              {!n.read && <span className="notification-card__dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
