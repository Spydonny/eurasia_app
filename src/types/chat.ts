export interface ChatRoom {
  id: string;
  event_id: string;
  name: string;
  member_count: number;
  last_message_content: string;
  last_message_at: string;
  is_member: boolean;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}
