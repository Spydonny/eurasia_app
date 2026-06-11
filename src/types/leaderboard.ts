export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  xp_total: number;
  tokens_total: number;
  events_attended: number;
  events_created: number;
  missions_completed: number;
  friends_count: number;
  city: string;
  organization_id: string;
  rank: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  period: string;
}
