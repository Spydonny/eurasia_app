import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MissionWithProgress, MissionSubmission } from '@/types';
import { submitMissionProof, redeemMissionCode } from '@/api';
import { Icons, type IconType, Button, Input } from '@/components/ui';

interface MissionCardProps {
  data: MissionWithProgress;
  submission?: MissionSubmission;
  onSubmitted?: () => void;
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

export function MissionCard({ data, submission, onSubmitted }: MissionCardProps) {
  const { t } = useTranslation();
  const { mission, progress } = data;
  const current = progress?.current_count ?? 0;
  const isDone = progress?.is_completed ?? false;
  const pct = getProgressPercent(current, mission.target_count);
  const MissionIcon = MISSION_ICONS[mission.category] || Icons.mission;

  const [formOpen, setFormOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [proofDesc, setProofDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState('');

  const pending = submission?.status === 'pending_review';
  const rejected = submission?.status === 'rejected';
  // Show the proof workflow only for submission-based missions that aren't done.
  const canSubmit = mission.requires_submission && !isDone && !pending;

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await submitMissionProof(mission.id, {
        screenshot_url: screenshotUrl.trim(),
        description: proofDesc.trim(),
        verification_method: 'screenshot',
      });
      setFormOpen(false);
      setScreenshotUrl('');
      setProofDesc('');
      onSubmitted?.();
    } catch {
      setError(t('missions.submit_error'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRedeemCode() {
    setCodeError('');
    setRedeeming(true);
    try {
      await redeemMissionCode(mission.id, code.trim());
      setCode('');
      onSubmitted?.();
    } catch {
      setCodeError(t('missions.code_error'));
    } finally {
      setRedeeming(false);
    }
  }

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
          <div className="mission-card__fill" style={{ width: `${pct}%` }} />
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

      {/* Submission workflow (manual-proof missions) */}
      {mission.requires_submission && !isDone && (
        <div className="mission-card__submission">
          {pending && (
            <span className="badge badge--warning">{t('missions.status_pending')}</span>
          )}
          {rejected && (
            <span className="badge badge--error">{t('missions.status_rejected')}</span>
          )}
          {canSubmit && !formOpen && (
            <Button className="btn--secondary btn--sm" onClick={() => setFormOpen(true)}>
              {rejected ? t('missions.resubmit') : t('missions.submit_proof')}
            </Button>
          )}
          {formOpen && (
            <div className="mission-card__form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
              <Input
                label={t('missions.screenshot_url')}
                placeholder="https://..."
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
              />
              <Input
                label={t('missions.proof_description')}
                placeholder={t('missions.proof_description_ph')}
                value={proofDesc}
                onChange={(e) => setProofDesc(e.target.value)}
              />
              {error && <div className="alert alert--error">{error}</div>}
              <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                <Button className="btn--primary btn--sm" loading={submitting} onClick={handleSubmit}>
                  {t('missions.submit')}
                </Button>
                <Button className="btn--ghost btn--sm" onClick={() => setFormOpen(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Promo-code verification */}
      {mission.has_code && !isDone && (
        <div className="mission-card__submission">
          <div style={{ display: 'flex', gap: 'var(--s-2)', width: '100%', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label={t('missions.enter_code')}
                placeholder={t('missions.code_placeholder')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button className="btn--primary btn--sm" loading={redeeming} disabled={!code.trim()} onClick={handleRedeemCode}>
              {t('missions.redeem_code')}
            </Button>
          </div>
          {codeError && <div className="alert alert--error">{codeError}</div>}
        </div>
      )}
    </div>
  );
}
