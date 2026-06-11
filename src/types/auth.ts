import type { UserRole } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export type RegisterableRole = 'volunteer' | 'organization' | 'partner';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role?: RegisterableRole;
}

export interface OrganizationRegisterRequest {
  email: string;
  username: string;
  password: string;
  referral_code?: string;
  name: string;
  description?: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  city?: string;
  region?: string;
  categories?: string[];
  social_links?: Record<string, string>;
}

export interface PartnerRegisterRequest {
  email: string;
  username: string;
  password: string;
  referral_code?: string;
  brand_name: string;
  description?: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  city?: string;
  categories?: string[];
  social_links?: Record<string, string>;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export type ProviderStatus = 'approved' | 'pending' | 'rejected' | 'none';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  level?: number;
  tokens_balance?: number;
  /** Approval state for organization/partner accounts. Volunteers/admins are always "approved". */
  provider_status?: ProviderStatus;
}
