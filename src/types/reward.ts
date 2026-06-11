export type RewardType =
  | 'discount'
  | 'product'
  | 'service'
  | 'event_access'
  | 'trip'
  | 'education_program'
  | 'merch'
  | 'partner_offer'
  | 'special';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  partner_id: string;
  partner_name?: string;
  price_tokens: number;
  total_inventory: number;
  remaining_inventory: number;
  max_per_user: number;
  available: boolean;
  image_url: string;
  metadata: Record<string, unknown>;
  expiration_days: number;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  reward_name: string;
  reward_type: string;
  partner_id: string;
  price_paid: number;
  status: string;
  issued_code?: string;
  notes: string;
  reviewed_by: string;
  reviewed_at: string;
  fulfilled_at: string;
  refunded_at: string;
  created_at: string;
  updated_at: string;
}

export const REWARD_TYPE_LABELS: Record<string, string> = {
  discount: 'Discount',
  product: 'Product',
  service: 'Service',
  event_access: 'Event Access',
  trip: 'Trip',
  education_program: 'Education Program',
  merch: 'Merch',
  partner_offer: 'Partner Offer',
  special: 'Special',
};

export const REWARD_TYPE_ICONS: Record<string, string> = {
  discount: '🏷️',
  product: '📦',
  service: '🔧',
  event_access: '🎟️',
  trip: '✈️',
  education_program: '🎓',
  merch: '👕',
  partner_offer: '🤝',
  special: '⭐',
};
