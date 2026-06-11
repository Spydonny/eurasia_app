export interface PrivacySettings {
  show_contacts: boolean;
  show_social_links: boolean;
  show_activity_feed: boolean;
  show_event_history: boolean;
  show_reward_history: boolean;
  allow_friend_requests: boolean;
}

export interface PrivacySettingsUpdate {
  show_contacts?: boolean;
  show_social_links?: boolean;
  show_activity_feed?: boolean;
  show_event_history?: boolean;
  show_reward_history?: boolean;
  allow_friend_requests?: boolean;
}
