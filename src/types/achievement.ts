export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  token_reward: number;
}

export interface UserAchievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  xp_reward: number;
  tokens_reward: number;
  unlocked_at: string;
}

export interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  tier: number;
  xp_threshold: number;
}

export interface UserBadge {
  id: string;
  badge_type: string;
  label: string;
  description: string;
  earned_at: string;
}
