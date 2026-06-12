import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  listPartners,
  updatePartner,
  getPartnerRewards,
  getPartnerRedemptions,
  getPartnerRewardStats,
  createPartnerReward,
} from '@/api';
import type { Partner, Reward, RewardRedemption } from '@/types';
import { Button, Input, Icons } from '@/components/ui';

const EMPTY_CONTACT = { contact_email: '', contact_phone: '', city: '', website: '' };
const REWARD_TYPES = [
  'discount', 'product', 'service', 'event_access', 'trip',
  'education_program', 'merch', 'partner_offer', 'special',
] as const;

/**
 * Partner profile/dashboard. Rendered inside /profile for partner accounts.
 * Brand name and description come from registration — there is no profile form
 * here; partners manage their reward offers only.
 */
export function PartnerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'discount',
    price_tokens: '50',
    total_inventory: '100',
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_CONTACT);

  const approved = (user?.provider_status ?? 'approved') === 'approved';

  const openEdit = () => {
    if (!partner) return;
    setForm({
      contact_email: partner.contact_email,
      contact_phone: partner.contact_phone,
      city: partner.city,
      website: partner.website,
    });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!partner) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updatePartner(partner.id, form);
      setPartner(updated);
      setEditing(false);
      setMessage(t('partner.saved'));
    } catch {
      setError(t('partner.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await listPartners(undefined, 1, 1, user.id);
      const myPartner = res.items?.[0] || null;
      setPartner(myPartner);
      if (myPartner) {
        const [r, red, s] = await Promise.all([
          getPartnerRewards(myPartner.id),
          getPartnerRedemptions(myPartner.id),
          getPartnerRewardStats(myPartner.id),
        ]);
        setRewards(r.items || []);
        setRedemptions(red.items || []);
        setStats(s);
      }
    } catch {
      setError(t('partner.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setSaving(true);
    setError('');
    try {
      await createPartnerReward(partner.id, {
        name: rewardForm.name,
        description: rewardForm.description,
        type: rewardForm.type,
        price_tokens: parseInt(rewardForm.price_tokens, 10) || 0,
        total_inventory: parseInt(rewardForm.total_inventory, 10) || 0,
      });
      setShowRewardForm(false);
      setRewardForm({ name: '', description: '', type: 'discount', price_tokens: '50', total_inventory: '100' });
      setMessage(t('partner.reward_created'));
      await load();
    } catch {
      setError(t('partner.reward_create_failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;

  if (!partner) {
    return (
      <div className="page">
        <div className="empty-state">
          <Icons.partner className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('partner.no_profile', 'No partner profile found.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      {/* Header */}
      <div className="profile__header">
        <div className="profile__avatar">{partner.brand_name.charAt(0).toUpperCase()}</div>
        <div className="profile__info">
          <h1 className="profile__display-name">{partner.brand_name}</h1>
          <div className="profile__role">{t('nav.partner')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => (editing ? setEditing(false) : openEdit())}>
            {editing ? t('common.cancel') : t('common.edit', 'Edit')}
          </button>
          {approved && (
            <button className="btn btn--primary btn--sm" onClick={() => setShowRewardForm(!showRewardForm)}>
              {t('partner.add_reward')}
            </button>
          )}
        </div>
      </div>

      {partner.description && <p className="profile__bio">{partner.description}</p>}

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '12px 0 20px' }}>
          <Input label={t('auth.email')} type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input label={t('org.phone')} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          <Input label={t('org.city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label={t('org.website')} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Button loading={saving} onClick={handleSaveProfile}>{t('common.save')}</Button>
        </div>
      )}

      {/* Stats */}
      <div className="profile__stats">
        <div className="stat-card">
          <div className="stat-card__value">{String(stats?.total_rewards ?? partner.total_rewards)}</div>
          <div className="stat-card__label">{t('partner.rewards')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{String(stats?.total_redemptions ?? partner.total_redemptions)}</div>
          <div className="stat-card__label">{t('partner.redemptions')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{t(`org.status.${partner.status}`, partner.status)}</div>
          <div className="stat-card__label">{t('org.verification')}</div>
        </div>
      </div>

      {showRewardForm && approved && (
        <form onSubmit={handleCreateReward} style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
          <h3 className="profile__section-title">{t('partner.new_reward')}</h3>
          <Input label={t('partner.reward_name')} value={rewardForm.name} onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })} required />
          <Input label={t('partner.description')} value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })} required />
          <div className="input__wrapper">
            <label className="input__label">{t('partner.reward_type')}</label>
            <select className="input" value={rewardForm.type} onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}>
              {REWARD_TYPES.map((k) => (
                <option key={k} value={k}>{t(`reward_type.${k}`, k)}</option>
              ))}
            </select>
          </div>
          <Input label={t('partner.price_tokens')} type="number" value={rewardForm.price_tokens} onChange={(e) => setRewardForm({ ...rewardForm, price_tokens: e.target.value })} required />
          <Input label={t('partner.inventory')} type="number" value={rewardForm.total_inventory} onChange={(e) => setRewardForm({ ...rewardForm, total_inventory: e.target.value })} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="submit" loading={saving}>{t('common.create')}</Button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowRewardForm(false)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {/* Rewards */}
      <h3 className="profile__section-title" style={{ marginTop: 16 }}>{t('partner.my_rewards')}</h3>
      {rewards.length === 0 ? (
        <div className="empty-state">
          <Icons.redeem className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('partner.no_rewards')}</p>
        </div>
      ) : (
        <div className="activity-feed" style={{ marginBottom: 24 }}>
          {rewards.map((r) => (
            <div key={r.id} className="activity-item">
              <div className="activity-item__icon"><Icons.redeem size={18} /></div>
              <div className="activity-item__body">
                <div className="activity-item__title">{r.name}</div>
                <div className="activity-item__description" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icons.balance size={13} /> {r.price_tokens} · {r.remaining_inventory} {t('partner.left')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage */}
      <h3 className="profile__section-title">{t('partner.usage')}</h3>
      {redemptions.length === 0 ? (
        <div className="empty-state">
          <Icons.empty className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('partner.no_redemptions')}</p>
        </div>
      ) : (
        <div className="token-history">
          {redemptions.map((red) => (
            <div key={red.id} className="token-row">
              <div className="token-row__info">
                <span className="token-row__type">{red.reward_name}</span>
                <span className="token-row__desc" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{t(`redemption.${red.status}`, red.status)} · <Icons.balance size={12} /> {red.price_paid}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
