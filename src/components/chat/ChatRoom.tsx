import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '@/types';
import { Icons, TranslatableText } from '@/components/ui';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'}`}>
      {!isOwn && <div className="chat-bubble__author">{message.username}</div>}
      <TranslatableText as="div" className="chat-bubble__text" text={message.content} />
      <div className="chat-bubble__time">{time}</div>
    </div>
  );
}

// ─── Chat message input ───

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="chat-input__field"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('chat.type_message')}
        disabled={disabled}
        maxLength={2000}
      />
      <button className="chat-input__btn" type="submit" disabled={disabled || !text.trim()} aria-label={t('chat.send')}>
        <Icons.send size={18} weight="fill" />
      </button>
    </form>
  );
}

// ─── Chat room component ───

interface ChatRoomViewProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSend: (text: string) => void;
  connected: boolean;
  loading?: boolean;
}

export function ChatRoomView({
  messages,
  currentUserId,
  onSend,
  connected,
  loading,
}: ChatRoomViewProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-room">
      <div className="chat-room__header">
        <span className={`chat-room__status ${connected ? 'chat-room__status--online' : 'chat-room__status--offline'}`}>
          <Icons.onlineStatus size={10} weight="fill" />
          {connected ? t('chat.connected') : t('chat.disconnected')}
        </span>
      </div>

      <div className="chat-room__messages">
        {loading && <div className="chat-room__loader">{t('common.loading')}</div>}

        {!loading && messages.length === 0 && (
          <div className="chat-room__empty">
            <Icons.conversation size={32} />
            <p>{t('messages.no_messages')}</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} isOwn={msg.user_id === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={!connected} />
    </div>
  );
}
