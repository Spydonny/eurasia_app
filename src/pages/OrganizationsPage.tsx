import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listOrganizations, getOrganization, getOrganizationMembers } from '@/api';
import type { Organization, OrganizationMember } from '@/types';

export function OrganizationsPage() {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listOrganizations('approved', 1, 50);
      setOrganizations(res.items || []);
    } catch {
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-4"><p className="text-gray-500">{t('common.loading')}</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('organizations.title')}</h1>
        <button
          onClick={() => navigate('/organizations/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {t('organizations.create')}
        </button>
      </div>

      {organizations.length === 0 ? (
        <p className="text-gray-500">{t('organizations.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {organizations.map(org => (
            <div
              key={org.id}
              onClick={() => navigate(`/organizations/${org.id}`)}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    org.name[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{org.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{org.city}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{org.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(org.status)}`}>
                  {org.status.replace('_', ' ')}
                </span>
                <span className="text-gray-500">{t('organizations.member_count', { count: org.member_count })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationDetailPage() {
  // Handled via route params; this is a simplified view
  const { t } = useTranslation();
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const orgId = window.location.pathname.split('/').pop() || '';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [o, m] = await Promise.all([
        getOrganization(orgId),
        getOrganizationMembers(orgId),
      ]);
      setOrg(o);
      setMembers(m);
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="max-w-3xl mx-auto p-4"><p className="text-gray-500">{t('common.loading')}</p></div>;
  }

  if (!org) {
    return <div className="max-w-3xl mx-auto p-4"><p className="text-gray-500">{t('organizations.not_found')}</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
            {org.logo_url ? (
              <img src={org.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              org.name[0]?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            {org.city && <p className="text-gray-500">{org.city}{org.region ? `, ${org.region}` : ''}</p>}
          </div>
        </div>

        <p className="text-gray-700 mb-4">{org.description || t('organizations.no_description')}</p>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xl font-bold">{org.member_count}</p>
            <p className="text-sm text-gray-500">{t('organizations.members')}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xl font-bold">{org.total_events}</p>
            <p className="text-sm text-gray-500">{t('organizations.events')}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xl font-bold">{org.total_participants}</p>
            <p className="text-sm text-gray-500">{t('organizations.participants')}</p>
          </div>
        </div>

        {org.contact_email && (
          <p className="text-sm text-gray-600 mb-1">{t('organizations.email', { email: org.contact_email })}</p>
        )}
        {org.contact_phone && (
          <p className="text-sm text-gray-600 mb-1">{t('organizations.phone', { phone: org.contact_phone })}</p>
        )}
        {org.website && (
          <p className="text-sm text-gray-600 mb-1">
            <a href={org.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{t('organizations.website', { website: org.website })}</a>
          </p>
        )}

        {org.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {org.categories.map(cat => (
              <span key={cat} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{cat}</span>
            ))}
          </div>
        )}
      </div>

      {members.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">{t('organizations.members')} ({members.length})</h2>
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    m.display_name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <p className="font-medium">{m.display_name || m.username || m.user_id}</p>
                <span className="text-xs text-gray-500 ml-auto">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
