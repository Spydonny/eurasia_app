import { useTranslation } from 'react-i18next';
import type { MissionWithProgress } from '@/types';
import { Icons, type IconType } from '@/components/ui';

interface MissionCardProps {
  data: MissionWithProgress;
}

const MISSION_ICONS: Record<string, IconType> = {
  event_attend: Icons.eventDetail,
  event_create: Icons.eventCreate,
  xp_earn: Icons.progress,
  tokens_earn: Icons.balance,
};

function getProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function MissionCard({ data }: MissionCardProps) {
  const { t } = useTranslation();
  const { mission, progress } = data;
  const current = progress?.current_count ?? 0;
  const isDone = progress?.is_completed ?? false;
  const pct = getProgressPercent(current, mission.target_count);
  const MissionIcon = MISSION_ICONS[mission.category] || Icons.mission;

  return (
    <div className={`mission-card ${isDone ? 'mission-card--done' : ''}`}>
      <div className="mission-card__header">
        <span className="mission-card__icon"><MissionIcon size={24} /></span>
        <div className="mission-card__info">
          <h3 className="mission-card__title">{mission.title}</h3>
          <span className="mission-card__category">
            {t(`missions.categories.${mission.category}`, mission.category)}
          </span>
        </div>
        {isDone && <span className="mission-card__check"><Icons.success size={18} /></span>}
      </div>

      <p className="mission-card__desc">{mission.description}</p>

      <div className="mission-card__progress">
        <div className="mission-card__bar">
          <div
            className="mission-card__fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="mission-card__count">
          {current} / {mission.target_count}
        </span>
      </div>

      {(mission.reward_xp > 0 || mission.reward_tokens > 0) && (
        <div className="mission-card__rewards">
          {mission.reward_xp > 0 && (
            <span className="mission-card__reward">+{mission.reward_xp} XP</span>
          )}
          {mission.reward_tokens > 0 && (
            <span className="mission-card__reward mission-card__reward--tokens" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              +{mission.reward_tokens} <Icons.balance size={12} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
