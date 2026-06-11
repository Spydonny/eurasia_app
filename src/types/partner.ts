export interface Partner {
  id: string;
  brand_name: string;
  slug: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  logo_url: string;
  cover_url: string;
  city: string;
  categories: string[];
  social_links: Record<string, string>;
  status: string;
  owner_id: string;
  admin_ids: string[];
  total_rewards: number;
  total_redemptions: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerRequest {
  brand_name: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  city?: string;
  categories?: string[];
  social_links?: Record<string, string>;
}
