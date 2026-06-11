export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  logo_url: string;
  cover_url: string;
  city: string;
  region: string;
  categories: string[];
  social_links: Record<string, string>;
  status: string;
  verification_status: string;
  owner_id: string;
  admin_ids: string[];
  member_count: number;
  total_events: number;
  total_participants: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  city?: string;
  region?: string;
  categories?: string[];
  social_links?: Record<string, string>;
}
