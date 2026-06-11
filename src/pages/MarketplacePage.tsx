import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listMarketplaceItems, buyMarketplaceItem, getMyPurchases, getTokenBalance } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import type { MarketplaceItem } from '@/types';
import { ITEM_TYPE_LABELS } from '@/types';
import { Icons } from '@/components/ui';

const TYPES = ['', 'badge', 'title', 'powerup', 'customization'];

export function MarketplacePage() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filter, setFilter] = useState('');
  const [balance, setBalance] = useState(0);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [allItems, purchases, bal] = await Promise.all([
        listMarketplaceItems(filter || undefined),
        getMyPurchases(),
        getTokenBalance(),
      ]);
      setItems(allItems);
      setOwnedIds(new Set(purchases.map((p) => p.item_id)));
      setBalance(bal.balance);
    } catch {
      setMessage({ type: 'error', text: t('marketplace.error') });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [filter]);

  async function handleBuy(itemId: string) {
    setBuying(itemId);
    setMessage(null);
    try {
      const res = await buyMarketplaceItem(itemId);
      setMessage({ type: 'success', text: res.message });
      setOwnedIds((prev) => new Set(prev).add(itemId));
      setBalance(res.tokens_remaining);
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.detail || t('marketplace.purchase_failed') });
    } finally {
      setBuying(null);
    }
  }

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">{t('marketplace.title')}</h1>
        <span className="token-widget">
          <Icons.balance className="token-widget__icon" size={16} />
          <span className="token-widget__amount">{balance}</span>
        </span>
      </div>

      {message && <div className={`alert alert--${message.type}`}>{message.text}</div>}

      <div className="filter-tabs">
        {TYPES.map((type) => (
          <button
            key={type}
            className={`filter-tab ${filter === type ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type ? (ITEM_TYPE_LABELS[type] || type) : t('marketplace.filter_all')}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Icons.marketplace className="empty-state__icon" size={32} />
          <p className="empty-state__text">{t('marketplace.empty')}</p>
        </div>
      ) : (
        <div className="marketplace-grid">
          {items.map((item) => {
            const owned = item.owned || ownedIds.has(item.id);
            const soldOut = !item.available && !owned;
            const affordable = balance >= item.price;

            return (
              <div
                key={item.id}
                className={`item-card ${owned ? 'item-card--owned' : ''} ${soldOut ? 'item-card--soldout' : ''}`}
              >
                <div className="item-card__icon">{item.icon}</div>
                <h3 className="item-card__name">{item.name}</h3>
                <p className="item-card__desc">{item.description}</p>

                <div className="item-card__meta">
                  <span className="item-card__type">{ITEM_TYPE_LABELS[item.type] || item.type}</span>
                  <span className="item-card__price" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icons.balance size={13} /> {item.price}</span>
                </div>

                {owned ? (
                  <span className="badge badge--success"><Icons.success size={12} /> {t('marketplace.owned')}</span>
                ) : soldOut ? (
                  <span className="badge badge--neutral">{t('marketplace.unavailable')}</span>
                ) : affordable ? (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => handleBuy(item.id)}
                    disabled={buying === item.id}
                  >
                    {buying === item.id ? t('marketplace.buying') : t('marketplace.buy')}
                  </button>
                ) : (
                  <button className="btn btn--secondary btn--sm" disabled>
                    {t('marketplace.need_more', { amount: item.price - balance })}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 'var(--s-5)' }}>
        <Link to="/marketplace/my" className="btn btn--ghost btn--sm">{t('marketplace.view_my_items')}</Link>
      </div>
    </div>
  );
}
