import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons, type IconType } from '@/components/ui';
import {
  getAdminStats,
  listAdminUsers,
  listAdminEvents,
  updateUserRole,
  updateEventStatus,
  updateEvent,
  moderateEvent,
  listAdminOrganizations,
  adjustUserTokens,
  getAdminTokenStats,
  approveOrganization,
  rejectOrganization,
  listPartners,
  approvePartner,
  rejectPartner,
} from '@/api';
import { ROLE_LABELS, UserRole } from '@/types';
import type { AuthUser, Event, Organization, Partner } from '@/types';

const VALID_ROLES: UserRole[] = ['volunteer', 'organization', 'partner', 'admin'];
const VALID_STATUSES = ['draft', 'pending_review', 'published', 'in_progress', 'completed', 'cancelled', 'rejected'];

type Tab = 'dashboard' | 'users' | 'events' | 'organizations' | 'partners' | 'tokens';

export function AdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tokenStats, setTokenStats] = useState<{ total_earned: number; total_spent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [tokenForm, setTokenForm] = useState({ userId: '', amount: '', reason: '' });
  const [eventRewards, setEventRewards] = useState<Record<string, string>>({});

  const ok = (text: string) => setMessage({ text, error: false });
  const err = (text: string) => setMessage({ text, error: true });

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const s = await getAdminStats();
      setStats(s);
    } catch { err(t('admin.error_stats')); }
    finally { setLoading(false); }
  }

  async function loadUsers(s?: string) {
    setLoading(true);
    try {
      const data = await listAdminUsers(s || search || undefined);
      setUsers(data);
    } catch { err(t('admin.error_users')); }
    finally { setLoading(false); }
  }

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await listAdminEvents('pending_review');
      setEvents(data);
    } catch { err(t('admin.error_events')); }
    finally { setLoading(false); }
  }

  async function loadOrganizations() {
    setLoading(true);
    try {
      const data = await listAdminOrganizations('pending_review');
      setOrganizations(data.items || []);
    } catch { err(t('admin.error_organizations')); }
    finally { setLoading(false); }
  }

  async function loadPartners() {
    setLoading(true);
    try {
      const data = await listPartners('pending_review');
      setPartners(data.items || []);
    } catch { err(t('admin.error_partners')); }
    finally { setLoading(false); }
  }

  async function loadTokenStats() {
    setLoading(true);
    try {
      const data = await getAdminTokenStats();
      setTokenStats(data);
    } catch { err(t('admin.error_token_stats')); }
    finally { setLoading(false); }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: role as UserRole } : u)));
      ok(t('admin.role_updated', { role }));
    } catch { err(t('admin.error_role')); }
  }

  async function handleStatusChange(eventId: string, status: string) {
    try {
      await updateEventStatus(eventId, status);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status } : e)));
      ok(t('admin.status_updated', { status }));
    } catch { err(t('admin.error_status')); }
  }

  async function handleApproveEvent(eventId: string) {
    try {
      const rewardTokens = parseInt(eventRewards[eventId] || '0', 10);
      if (rewardTokens > 0) {
        await updateEvent(eventId, { reward_tokens: rewardTokens });
      }
      await moderateEvent(eventId, 'approve');
      await updateEventStatus(eventId, 'published');
      ok(t('admin.event_approved'));
      await loadEvents();
    } catch { err(t('admin.error_approve_event')); }
  }

  async function handleRejectEvent(eventId: string) {
    try {
      await moderateEvent(eventId, 'reject', t('admin.reject_reason'));
      ok(t('admin.event_rejected'));
      await loadEvents();
    } catch { err(t('admin.error_reject_event')); }
  }

  async function handleOrgApprove(orgId: string) {
    try {
      await approveOrganization(orgId);
      ok(t('admin.org_approved'));
      await loadOrganizations();
    } catch { err(t('admin.error_approve_org')); }
  }

  async function handleOrgReject(orgId: string) {
    try {
      await rejectOrganization(orgId, t('admin.reject_reason'));
      ok(t('admin.org_rejected'));
      await loadOrganizations();
    } catch { err(t('admin.error_reject_org')); }
  }

  async function handlePartnerApprove(partnerId: string) {
    try {
      await approvePartner(partnerId);
      ok(t('admin.partner_approved'));
      await loadPartners();
    } catch { err(t('admin.error_approve_partner')); }
  }

  async function handlePartnerReject(partnerId: string) {
    try {
      await rejectPartner(partnerId, t('admin.reject_reason'));
      ok(t('admin.partner_rejected'));
      await loadPartners();
    } catch { err(t('admin.error_reject_partner')); }
  }

  async function handleAdjustTokens(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adjustUserTokens(tokenForm.userId, parseInt(tokenForm.amount, 10), tokenForm.reason);
      ok(t('admin.tokens_adjusted'));
      setTokenForm({ userId: '', amount: '', reason: '' });
    } catch { err(t('admin.error_adjust_tokens')); }
  }

  function switchTab(nextTab: Tab) {
    setTab(nextTab);
    setMessage(null);
    if (nextTab === 'users') loadUsers();
    else if (nextTab === 'events') loadEvents();
    else if (nextTab === 'organizations') loadOrganizations();
    else if (nextTab === 'partners') loadPartners();
    else if (nextTab === 'tokens') loadTokenStats();
    else loadDashboard();
  }

  const StatCard = ({ label, value, icon: Icon }: { label: string; value: number; icon: IconType }) => (
    <div className="stat-card">
      <span className="stat-card__icon"><Icon size={18} /></span>
      <div className="stat-card__value">{value.toLocaleString()}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page__title">{t('admin.title')}</h1>

      {message && <div className={`alert ${message.error ? 'alert--error' : 'alert--success'}`}>{message.text}</div>}

      <div className="tabs" style={{ overflowX: 'auto' }}>
        {(['dashboard', 'users', 'events', 'organizations', 'partners', 'tokens'] as Tab[]).map((tb) => (
          <button key={tb} className={`tab ${tab === tb ? 'tab--active' : ''}`} onClick={() => switchTab(tb)}>
            {t(`admin.tab_${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          {loading ? <div className="page-loader">{t('admin.loading_stats')}</div> : (
            <div className="stats-row">
              <StatCard icon={Icons.users} label={t('admin.stat_users')} value={stats?.users || 0} />
              <StatCard icon={Icons.navEvents} label={t('admin.stat_events')} value={stats?.events || 0} />
              <StatCard icon={Icons.organization} label={t('admin.stat_organizations')} value={stats?.organizations || 0} />
              <StatCard icon={Icons.partner} label={t('admin.stat_partners')} value={stats?.partners || 0} />
              <StatCard icon={Icons.redeem} label={t('admin.stat_rewards')} value={stats?.total_rewards || 0} />
              <StatCard icon={Icons.profile} label={t('admin.stat_active_users')} value={stats?.active_users || 0} />
            </div>
          )}
          <div className="stat-card stat-card--wide" style={{ marginTop: 16 }}>
            <div className="stat-card__label">{t('admin.stat_total_tokens')}</div>
            <div className="stat-card__value" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{stats?.total_tokens?.toLocaleString() || 0} <Icons.balance size={20} /></div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              className="input"
              placeholder={t('admin.search_users')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              style={{ flex: 1 }}
            />
            <button className="btn btn--primary btn--sm" onClick={() => loadUsers()}>{t('admin.search_btn')}</button>
          </div>

          {loading ? <div className="page-loader">{t('admin.loading_users')}</div> : (
            <div className="admin-table">
              <div className="admin-table__header">
                <span>{t('admin.table_username')}</span>
                <span>{t('admin.table_email')}</span>
                <span>{t('admin.table_role')}</span>
                <span>{t('admin.table_actions')}</span>
              </div>
              {users.map((u) => (
                <div key={u.id} className="admin-table__row">
                  <span className="admin-table__cell">{u.username}</span>
                  <span className="admin-table__cell admin-table__cell--muted">{u.email}</span>
                  <span className="admin-table__cell">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="admin-table__select"
                    >
                      {VALID_ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </span>
                  <span className="admin-table__cell">{ROLE_LABELS[u.role]}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'events' && (
        <>
          {loading ? <div className="page-loader">{t('admin.loading_events')}</div> : (
            <div className="admin-table">
              <div className="admin-table__header">
                <span>{t('admin.table_title')}</span>
                <span>{t('admin.table_creator')}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{t('admin.table_reward')} <Icons.balance size={12} /></span>
                <span>{t('admin.table_actions')}</span>
              </div>
              {events.map((e) => (
                <div key={e.id} className="admin-table__row">
                  <span className="admin-table__cell admin-table__cell--bold">{e.title}</span>
                  <span className="admin-table__cell admin-table__cell--muted">{e.creator_name}</span>
                  <span className="admin-table__cell">
                    <input
                      className="input"
                      type="number"
                      placeholder={t('admin.placeholder_tokens')}
                      value={eventRewards[e.id] ?? String(e.reward_tokens ?? 0)}
                      onChange={(ev) => setEventRewards({ ...eventRewards, [e.id]: ev.target.value })}
                      style={{ width: 80 }}
                    />
                  </span>
                  <span className="admin-table__cell" style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn--primary btn--sm" onClick={() => handleApproveEvent(e.id)} aria-label={t('admin.approve')}><Icons.success size={14} /></button>
                    <button className="btn btn--ghost btn--sm" onClick={() => handleRejectEvent(e.id)} aria-label={t('admin.reject')}><Icons.error size={14} /></button>
                    <select
                      value={e.status}
                      onChange={(e2) => handleStatusChange(e.id, e2.target.value)}
                      className="admin-table__select"
                    >
                      {VALID_STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </span>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>{t('admin.no_events')}</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'organizations' && (
        <>
          {loading ? <div className="page-loader">{t('admin.loading_organizations')}</div> : (
            <div className="admin-table">
              <div className="admin-table__header">
                <span>{t('admin.table_name')}</span>
                <span>{t('admin.table_city')}</span>
                <span>{t('admin.table_status')}</span>
                <span>{t('admin.table_actions')}</span>
              </div>
              {organizations.map((o) => (
                <div key={o.id} className="admin-table__row">
                  <span className="admin-table__cell admin-table__cell--bold">{o.name}</span>
                  <span className="admin-table__cell admin-table__cell--muted">{o.city}</span>
                  <span className="admin-table__cell">{o.status}</span>
                  <span className="admin-table__cell" style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn--primary btn--sm" onClick={() => handleOrgApprove(o.id)}>{t('admin.approve')}</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => handleOrgReject(o.id)}>{t('admin.reject')}</button>
                  </span>
                </div>
              ))}
              {organizations.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>{t('admin.no_organizations')}</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'partners' && (
        <>
          {loading ? <div className="page-loader">{t('admin.loading_partners')}</div> : (
            <div className="admin-table">
              <div className="admin-table__header">
                <span>{t('admin.table_name')}</span>
                <span>{t('admin.table_city')}</span>
                <span>{t('admin.table_status')}</span>
                <span>{t('admin.table_actions')}</span>
              </div>
              {partners.map((p) => (
                <div key={p.id} className="admin-table__row">
                  <span className="admin-table__cell admin-table__cell--bold">{p.brand_name}</span>
                  <span className="admin-table__cell admin-table__cell--muted">{p.city}</span>
                  <span className="admin-table__cell">{p.status}</span>
                  <span className="admin-table__cell" style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn--primary btn--sm" onClick={() => handlePartnerApprove(p.id)}>{t('admin.approve')}</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => handlePartnerReject(p.id)}>{t('admin.reject')}</button>
                  </span>
                </div>
              ))}
              {partners.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>{t('admin.no_partners')}</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'tokens' && (
        <>
          {tokenStats && (
            <div className="profile__stats" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-card__value">{tokenStats.total_earned}</div>
                <div className="stat-card__label">{t('admin.total_earned')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__value">{tokenStats.total_spent}</div>
                <div className="stat-card__label">{t('admin.total_spent')}</div>
              </div>
            </div>
          )}
          <form onSubmit={handleAdjustTokens} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <h3 style={{ fontWeight: 700 }}>{t('admin.adjust_user_tokens')}</h3>
            <input className="input" placeholder={t('admin.placeholder_user_id')} value={tokenForm.userId} onChange={(e) => setTokenForm({ ...tokenForm, userId: e.target.value })} required />
            <input className="input" type="number" placeholder={t('admin.placeholder_amount')} value={tokenForm.amount} onChange={(e) => setTokenForm({ ...tokenForm, amount: e.target.value })} required />
            <input className="input" placeholder={t('admin.placeholder_reason')} value={tokenForm.reason} onChange={(e) => setTokenForm({ ...tokenForm, reason: e.target.value })} required />
            <button type="submit" className="btn btn--primary">{t('admin.adjust_tokens_btn')}</button>
          </form>
        </>
      )}
    </div>
  );
}
