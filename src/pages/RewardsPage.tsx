import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listRewards, reserveReward, getMyRedemptions } from '@/api';
import type { Reward, RewardRedemption } from '@/types';
import { REWARD_TYPE_LABELS } from '@/types';
import { Icons } from '@/components/ui';

/** Map a redemption status to a functional badge variant. */
function statusBadge(status: string): { cls: string; label: string } {
  const s = status.toLowerCase();
  const label = s.replace(/_/g, ' ');
  if (['fulfilled', 'approved', 'completed', 'verified', 'delivered'].includes(s)) {
    return { cls: 'badge--success', label };
  }
  if (['rejected', 'cancelled', 'canceled', 'refunded', 'expired'].includes(s)) {
    return { cls: 'badge--error', label };
  }
  if (['pending', 'reserved', 'awaiting', 'processing'].includes(s)) {
    return { cls: 'badge--warning', label };
  }
  return { cls: 'badge--neutral', label };
}

export function RewardsPage() {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my'>('catalog');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reserving, setReserving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [r, red] = await Promise.all([
        listRewards(1, 20),
        getMyRedemptions(1, 20),
      ]);
      setRewards(r.items || []);
      setRedemptions(red.items || []);
    } catch {
      setError(t('rewards.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const handleReserve = useCallback(async (rewardId: string) => {
    try {
      setReserving(rewardId);
      setError('');
      setSuccess('');
      const res = await reserveReward(rewardId);
      setSuccess(res.message);
      await load();
    } catch {
      setError(t('rewards.reserve_failed'));
    } finally {
      setReserving(null);
    }
  }, [load, t]);

  if (loading) {
    return <div className="page-loader">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <h1 className="page__title">{t('rewards.title')}</h1>
      <p className="page__subtitle">{t('rewards.subtitle')}</p>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'catalog' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          {t('rewards.catalog')}
        </button>
        <button
          className={`tab ${activeTab === 'my' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          {t('rewards.my_redemptions')} ({redemptions.length})
        </button>
      </div>

      {activeTab === 'catalog' && (
        rewards.length === 0 ? (
          <div className="empty-state">
            <Icons.redeem className="empty-state__icon" size={32} />
            <p className="empty-state__text">{t('rewards.empty')}</p>
          </div>
        ) : (
          <div className="missions-list">
            {rewards.map((reward) => {
              const soldOut = reward.remaining_inventory === 0;
              const unavailable = !reward.available;
              const lowStock = !soldOut && reward.remaining_inventory <= 5;
              const canReserve = reward.available && !soldOut;

              return (
                <div key={reward.id} className="reward-row">
                  <div className="reward-row__icon">
                    <Icons.redeem size={24} />
                  </div>

                  <div className="reward-row__body">
                    <div className="reward-row__head">
                      <span className="reward-row__name">{reward.name}</span>
                      {soldOut ? (
                        <span className="badge badge--error">{t('rewards.sold_out')}</span>
                      ) : unavailable ? (
                        <span className="badge badge--neutral">Unavailable</span>
                      ) : lowStock ? (
                        <span className="badge badge--warning">
                          {reward.remaining_inventory} {t('partner.left')}
                        </span>
                      ) : (
                        <span className="badge badge--success">Available</span>
                      )}
                    </div>
                    <div className="reward-row__meta">
                      <span className="tag">{REWARD_TYPE_LABELS[reward.type] || reward.type}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icons.balance size={13} /> {reward.price_tokens}</span>
                      {reward.partner_name && <span>· {reward.partner_name}</span>}
                    </div>
                    {reward.description && (
                      <p className="reward-row__desc">{reward.description}</p>
                    )}
                  </div>

                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleReserve(reward.id)}
                    disabled={!canReserve || reserving === reward.id}
                  >
                    {reserving === reward.id
                      ? '…'
                      : soldOut
                      ? t('rewards.sold_out')
                      : t('rewards.reserve')}
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'my' && (
        redemptions.length === 0 ? (
          <div className="empty-state">
            <Icons.empty className="empty-state__icon" size={32} />
            <p className="empty-state__text">{t('rewards.no_redemptions')}</p>
          </div>
        ) : (
          <div className="token-history">
            {redemptions.map((red) => {
              const badge = statusBadge(red.status);
              return (
                <div key={red.id} className="token-row">
                  <div className="token-row__info">
                    <span className="token-row__type">{red.reward_name}</span>
                    <span className="token-row__desc" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icons.balance size={12} /> {red.price_paid}</span>
                    {red.issued_code && (
                      <span className="redemption-code" title={t('rewards.code_hint')}>
                        {t('rewards.code')}: <code>{red.issued_code}</code>
                      </span>
                    )}
                  </div>
                  <div className="reward-row__status">
                    <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    <span className="token-row__desc">
                      {new Date(red.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
