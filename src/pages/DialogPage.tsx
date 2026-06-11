import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { getDialogs, getDialogMessages, sendDialogMessage } from '@/api';
import { ChatInput } from '@/components/chat';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/ui';
import type { PrivateDialog, PrivateMessage } from '@/types';

const POLL_INTERVAL_MS = 5000;

export function DialogPage() {
  const { t } = useTranslation();
  const { dialogId } = useParams<{ dialogId: string }>();
  const { user } = useAuth();
  const [dialog, setDialog] = useState<PrivateDialog | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!dialogId) return;
    try {
      const msgs = await getDialogMessages(dialogId);
      setMessages(msgs);
      setError('');
    } catch {
      setError(t('messages.load_failed'));
    }
  }, [dialogId, t]);

  useEffect(() => {
    if (!dialogId) return;
    let cancelled = false;
    (async () => {
      try {
        const [dialogs] = await Promise.all([getDialogs(), loadMessages()]);
        if (!cancelled) {
          setDialog(dialogs.find((d) => d.id === dialogId) || null);
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    })();

    const timer = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [dialogId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!dialogId) return;
    try {
      const msg = await sendDialogMessage(dialogId, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setError(t('messages.send_failed'));
    }
  };

  const otherName = dialog?.other_user?.display_name || dialog?.other_user?.username || '';

  return (
    <div className="page page--chat">
      <div className="chat-header">
        <Link to="/messages" className="btn btn--ghost btn--sm"><Icons.back size={16} /> {t('common.back')}</Link>
        <h2 className="chat-header__title">{otherName || t('messages.title')}</h2>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="chat-room">
        <div className="chat-room__messages">
          {loading && <div className="chat-room__loader">{t('common.loading')}</div>}

          {!loading && messages.length === 0 && (
            <div className="chat-room__empty">
              <Icons.conversation size={32} />
              <p>{t('messages.no_messages')}</p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={msg.id} className={`chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'}`}>
                {!isOwn && <div className="chat-bubble__author">{otherName}</div>}
                <div className="chat-bubble__text">{msg.content}</div>
                <div className="chat-bubble__time">{time}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
