import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { getEventChatRoom, getRoomMessages, getWsUrl } from '@/api';
import { ChatRoomView } from '@/components/chat';
import { useAuth } from '@/hooks/useAuth';
import type { ChatMessage, ChatRoom } from '@/types';
import { Icons } from '@/components/ui';

export function EventChatPage() {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  // Load room and history
  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    async function init() {
      try {
        const chatRoom = await getEventChatRoom(eventId!);
        if (cancelled) return;
        setRoom(chatRoom);

        const msgs = await getRoomMessages(chatRoom.id);
        if (!cancelled) setMessages(msgs);
      } catch {
        if (!cancelled) setError(t('chat_room.load_error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [eventId]);

  // WebSocket connection
  useEffect(() => {
    if (!room) return;
    const url = getWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', room_id: room.id }));
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'message' && msg.data) {
          setMessages((prev) => [...prev, msg.data]);
        } else if (msg.type === 'joined') {
          console.log('[Chat] Joined room:', msg.room_id);
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave', room_id: room.id }));
      }
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [room?.id]);

  const handleSend = useCallback(
    (content: string) => {
      if (!room || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(JSON.stringify({ type: 'message', room_id: room.id, content }));
    },
    [room?.id],
  );

  if (error) {
    return (
      <div className="page">
        <div className="alert alert--error">{error}</div>
        <Link to="/events" className="btn btn--ghost">{t('chat_page.back_to_events')}</Link>
      </div>
    );
  }

  return (
    <div className="page page--chat">
      <div className="chat-header">
        <Link to={`/events/${eventId}`} className="btn btn--ghost btn--sm"><Icons.back size={16} /> {t('common.back')}</Link>
        <h2 className="chat-header__title">{room?.name || t('chat_page.fallback_title')}</h2>
      </div>
      {user && (
        <ChatRoomView
          messages={messages}
          currentUserId={user.id}
          onSend={handleSend}
          connected={connected}
          loading={loading}
        />
      )}
    </div>
  );
}
