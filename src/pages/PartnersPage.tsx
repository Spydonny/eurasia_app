import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listPartners } from '@/api';
import type { Partner } from '@/types';

export function PartnersPage() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('approved');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listPartners(filter, 1, 50);
      setPartners(res.items || []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filters = [
    { key: 'approved', label: t('partners.filter_approved') },
    { key: 'draft', label: t('partners.filter_draft') },
    { key: 'pending_review', label: t('partners.filter_pending') },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('partners.title')}</h1>

      <div className="flex gap-1 mb-6 border-b">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
              filter === f.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">{t('common.loading')}</p>
      ) : partners.length === 0 ? (
        <p className="text-gray-500">{t('partners.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {partners.map(partner => (
            <div key={partner.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    partner.brand_name[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{partner.brand_name}</h3>
                  {partner.city && <p className="text-sm text-gray-500">{partner.city}</p>}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{partner.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('partners.rewards_count', { count: partner.total_rewards })}</span>
                <span className="text-gray-500">{t('partners.redemptions_count', { count: partner.total_redemptions })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
