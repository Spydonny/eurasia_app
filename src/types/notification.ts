export interface Notification {
  id: string;
  user_id: string;
  type: 'event_invite' | 'event_update' | 'chat_message' | 'mission_complete' | 'token_earned' | 'purchase' | 'system';
  title: string;
  message: string;
  reference_type: string;
  reference_id: string;
  read: boolean;
  created_at: string;
}

export const NOTIFICATION_ICONS: Record<string, string> = {
  event_invite: '📅',
  event_update: '🔄',
  chat_message: '💬',
  mission_complete: '🎯',
  token_earned: '🪙',
  purchase: '🛒',
  system: 'ℹ️',
};
