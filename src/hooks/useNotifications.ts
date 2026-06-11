import { useEffect, useState, useCallback } from 'react';
import { getUnreadCount, getNotificationWsUrl } from '@/api';
import type { Notification } from '@/types';
import { useAuth } from './useAuth';

interface UseNotificationsReturn {
  unreadCount: number;
  addNotification: (n: Notification) => void;
  refreshCount: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((n: Notification) => {
    window.dispatchEvent(new CustomEvent('notification', { detail: n }));
    setUnreadCount((prev) => prev + 1);
  }, []);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.count);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    refreshCount();

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let pingInterval: ReturnType<typeof setInterval>;
    let destroyed = false;

    function connect() {
      try {
        const url = getNotificationWsUrl();
        ws = new WebSocket(url);

        ws.onopen = () => {
          if (destroyed) { ws?.close(); return; }

          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send('ping');
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string);
            if (data.type === 'notification' && data.notification) {
              addNotification(data.notification);
            }
          } catch { /* ignore */ }
        };

        ws.onclose = () => {
          clearInterval(pingInterval);
          if (!destroyed) {
            reconnectTimer = setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        // Fallback polling
        const pollInterval = setInterval(refreshCount, 30000);
        return () => clearInterval(pollInterval);
      }
    }

    connect();

    return () => {
      destroyed = true;
      ws?.close();
      clearTimeout(reconnectTimer);
      clearInterval(pingInterval);
    };
  }, [user, refreshCount, addNotification]);

  return { unreadCount, addNotification, refreshCount };
}
