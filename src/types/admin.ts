export interface ProfileRewardRule {
  id: string;
  field_name: string;
  label: string;
  reward_tokens: number;
  reward_xp: number;
  is_active: boolean;
}

export interface AdminTokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  reference_type: string;
  reference_id: string;
  status: string;
  created_at: string;
}
