import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/api';
import type { Notification } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { Icons, type IconType } from '@/components/ui';

/** Map a notification type to a strict state icon (success/error/warning/info). */
export function notificationStateIcon(type: string): IconType {
  const t = type.toLowerCase();
  if (/(reject|fail|error|cancel|deduct|spent|block)/.test(t)) return Icons.error;
  if (/(approv|complete|success|earn|verifi|join|accept|won|level)/.test(t)) return Icons.success;
  if (/(pending|warning|expir|review|remind)/.test(t)) return Icons.warning;
  return Icons.info;
}

export function NotificationBell() {
  const { t } = useTranslation();
  const { unreadCount, refreshCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      listNotifications(10).then(setNotifications).catch(() => {});
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

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
    <div className="notification-bell" ref={dropdownRef}>
      <button className="notification-bell__btn" onClick={() => setOpen(!open)} aria-label={t('notifications.title')}>
        {unreadCount > 0 ? <Icons.unread size={20} weight="fill" /> : <Icons.notifications size={20} />}
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown__header">
            <span className="notification-dropdown__title">{t('notifications.title')}</span>
            <button className="btn btn--ghost btn--xs" onClick={handleMarkAllRead}>
              {t('notifications.mark_all_read')}
            </button>
          </div>

          <div className="notification-dropdown__list">
            {notifications.length === 0 && (
              <div className="notification-dropdown__empty">{t('notifications.empty_all')}</div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.read ? '' : 'notification-item--unread'}`}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                {(() => {
                  const Icon = notificationStateIcon(n.type);
                  return (
                    <span className="notification-item__icon">
                      <Icon size={18} />
                    </span>
                  );
                })()}
                <div className="notification-item__content">
                  <div className="notification-item__title">{n.title}</div>
                  <div className="notification-item__message">{n.message}</div>
                  <div className="notification-item__time">
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="notification-dropdown__footer">
            <Link to="/notifications" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>
              {t('notifications.view_all')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
