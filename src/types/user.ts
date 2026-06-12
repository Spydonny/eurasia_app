export type UserRole = 'volunteer' | 'organization' | 'partner' | 'admin';

export interface UserProfile {
  display_name: string;
  bio: string;
  avatar_url: string;
  interests: string[];
}

export interface User {
  _id: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  profile: UserProfile;
  level: number;
  experience: number;
  tokens_balance: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  phone: string;
  city: string;
  university: string;
  social_links: Record<string, string>;
  role: UserRole;
  level: number;
  experience: number;
  experience_to_next: number;
  tokens_balance: number;
  interests: string[];
  created_at: string;
}

export interface ProfileUpdateRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  interests?: string[];
  phone?: string;
  city?: string;
  university?: string;
  social_links?: Record<string, string>;
}

export interface TokenBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
}

export interface EventLocation {
  type: string;
  address: string;
  city: string;
  country: string;
  venue: string;
  online_url: string;
  lat: number | null;
  lng: number | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category: string;
  status: string;
  location: EventLocation;
  start_date: string;
  end_date: string;
  max_participants: number;
  participant_count: number;
  is_full: boolean;
  is_joined: boolean;
  created_by: string;
  creator_name: string;
  image_url: string;
  tags: string[];
  reward_tokens?: number;
  moderation_status?: string;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  confirmed?: boolean;
  checked_in?: boolean;
}

export interface EventListResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  short_description?: string;
  category: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  location?: Partial<EventLocation>;
  image_url?: string;
  tags?: string[];
  reward_tokens?: number;
  organization_id?: string;
  status?: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  volunteer: 1,
  organization: 2,
  partner: 3,
  admin: 4,
};

export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

