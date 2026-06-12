import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getMyPurchases } from '@/api';
import type { Purchase } from '@/types';
import { ITEM_TYPE_ICONS } from '@/types';
import { Icons, TranslatableText } from '@/components/ui';

export function MyItemsPage() {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getMyPurchases();
        if (!cancelled) setPurchases(data);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;

  return (
    <div className="page">
      <div className="page__header">
        <Link to="/marketplace" className="btn btn--ghost btn--sm"><Icons.back size={16} /> {t('common.back')}</Link>
        <h1 className="page__title">{t('marketplace.my_items')}</h1>
      </div>

      {purchases.length === 0 && (
        <div className="empty-state">
          <Icons.item className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('marketplace.my_items_empty')}</p>
          <Link to="/marketplace" className="btn btn--primary">{t('marketplace.browse')}</Link>
        </div>
      )}

      <div className="items-list">
        {purchases.map((p) => (
          <div key={p.id} className="purchase-item">
            <span className="purchase-item__icon">
              {p.image ? <img src={p.image} alt={p.item_name} className="purchase-item__image" /> : (ITEM_TYPE_ICONS[p.item_type] || '🎁')}
            </span>
            <div className="purchase-item__info">
              <TranslatableText as="div" className="purchase-item__name" text={p.item_name} />
              <div className="purchase-item__type">{t(`item_type.${p.item_type}`, p.item_type)}</div>
            </div>
            <div className="purchase-item__price" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>-{p.price_paid} <Icons.balance size={13} /></div>
            <div className="purchase-item__date">
              {new Date(p.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
