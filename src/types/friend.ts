export interface Friend {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  status: string;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  status: string;
  created_at: string;
}

export interface BlockedUser {
  id: string;
  blocked_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

export interface DialogUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface PrivateDialog {
  id: string;
  user_ids: string[];
  other_user?: DialogUser;
  last_message_content: string;
  last_message_at: string;
  unread_count: number;
}

export interface PrivateMessage {
  id: string;
  dialog_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}
