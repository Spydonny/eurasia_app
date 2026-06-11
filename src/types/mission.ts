export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  target_count: number;
  reward_xp: number;
  reward_tokens: number;
  requires_submission?: boolean;
  has_code?: boolean;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export type MissionSubmissionStatus = 'pending_review' | 'approved' | 'rejected';

export interface MissionSubmission {
  id: string;
  user_id: string;
  mission_id: string;
  mission_title?: string;
  description: string;
  screenshot_url: string;
  verification_method: string;
  status: MissionSubmissionStatus;
  reviewer_id: string;
  review_notes: string;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface MissionProgress {
  id: string;
  mission_id: string;
  current_count: number;
  is_completed: boolean;
  completed_at: string;
  reward_claimed: boolean;
}

export interface MissionWithProgress {
  mission: Mission;
  progress: MissionProgress | null;
}
