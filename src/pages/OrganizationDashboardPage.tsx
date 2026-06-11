import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  listOrganizations,
  updateOrganization,
  submitOrganizationReview,
  getOrganizationStatistics,
  getOrganizationEvents,
} from '@/api';
import type { Organization, Event } from '@/types';
import { Button, Input, Icons } from '@/components/ui';

const EMPTY_CONTACT = { contact_email: '', contact_phone: '', city: '', region: '', website: '' };

/**
 * Organization profile/dashboard. Rendered inside /profile for organization
 * accounts. Name and description come from registration — there is no profile
 * form here.
 */
export function OrganizationDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_CONTACT);

  const openEdit = () => {
    if (!org) return;
    setForm({
      contact_email: org.contact_email,
      contact_phone: org.contact_phone,
      city: org.city,
      region: org.region,
      website: org.website,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateOrganization(org.id, form);
      setOrg(updated);
      setEditing(false);
      setMessage(t('org.saved'));
    } catch {
      setError(t('org.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await listOrganizations(undefined, 1, 1, user.id);
      const myOrg = res.items?.[0] || null;
      setOrg(myOrg);
      if (myOrg) {
        const [s, e] = await Promise.all([
          getOrganizationStatistics(myOrg.id),
          getOrganizationEvents(myOrg.id, 1, 10),
        ]);
        setStats(s);
        setEvents(e.events || []);
      }
    } catch {
      setError(t('org.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitReview = async () => {
    if (!org) return;
    setSaving(true);
    setError('');
    try {
      await submitOrganizationReview(org.id);
      setMessage(t('org.submitted'));
      await load();
    } catch {
      setError(t('org.submit_failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;

  if (!org) {
    return (
      <div className="page">
        <div className="empty-state">
          <Icons.organization className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('org.no_profile', 'No organization profile found.')}</p>
        </div>
      </div>
    );
  }

  const statusLabel = t(`org.status.${org.status}`, org.status);
  const approved = (user?.provider_status ?? 'approved') === 'approved';

  return (
    <div className="profile">
      {/* Header */}
      <div className="profile__header">
        <div className="profile__avatar">{org.name.charAt(0).toUpperCase()}</div>
        <div className="profile__info">
          <h1 className="profile__display-name">{org.name}</h1>
          <div className="profile__role">{t('nav.organization')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => (editing ? setEditing(false) : openEdit())}>
            {editing ? t('common.cancel') : t('common.edit', 'Edit')}
          </button>
          {approved && (
            <Link to="/events/create" className="btn btn--primary btn--sm">{t('events.create')}</Link>
          )}
        </div>
      </div>

      {org.description && <p className="profile__bio">{org.description}</p>}

      {message && <div className="alert alert--success">{message}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '12px 0 20px' }}>
          <Input label={t('auth.email')} type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input label={t('org.phone')} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          <Input label={t('org.city')} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label={t('org.region', 'Region')} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <Input label={t('org.website')} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Button loading={saving} onClick={handleSave}>{t('common.save')}</Button>
        </div>
      )}

      {/* Stats */}
      <div className="profile__stats">
        <div className="stat-card">
          <div className="stat-card__value">{String(stats?.total_events ?? org.total_events)}</div>
          <div className="stat-card__label">{t('org.events')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{String(stats?.total_participants ?? org.total_participants)}</div>
          <div className="stat-card__label">{t('org.participants')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{org.member_count}</div>
          <div className="stat-card__label">{t('org.members')}</div>
        </div>
      </div>

      {/* Verification / approval */}
      <div className="stat-card stat-card--wide" style={{ margin: '16px 0' }}>
        <div className="stat-card__label">{t('org.verification')}</div>
        <div className="stat-card__value" style={{ fontSize: '1rem' }}>
          {statusLabel} · {t(`org.verif.${org.verification_status}`, org.verification_status)}
        </div>
        {org.status === 'draft' && (
          <Button className="btn--sm" style={{ marginTop: 12 }} loading={saving} onClick={handleSubmitReview}>
            {t('org.submit_review')}
          </Button>
        )}
        {org.status === 'pending_review' && (
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-3)' }}>{t('org.pending_hint')}</p>
        )}
      </div>

      {/* Events */}
      <h3 className="profile__section-title">{t('org.my_events')}</h3>
      {events.length === 0 ? (
        <div className="empty-state">
          <Icons.eventList className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('org.no_events')}</p>
        </div>
      ) : (
        <div className="activity-feed">
          {events.map((ev) => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="activity-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="activity-item__icon"><Icons.eventDetail size={18} /></div>
              <div className="activity-item__body">
                <div className="activity-item__title">{ev.title}</div>
                <div className="activity-item__description">
                  {t(`events.status.${ev.status}`, ev.status)} · {ev.participant_count} {t('org.participants')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
