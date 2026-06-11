export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target_count: number;
  reward_xp: number;
  reward_tokens: number;
  is_active: boolean;
  created_at: string;
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
