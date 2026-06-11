import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type TokenBalance, type TokenTransaction } from '@/types';
import * as api from '@/api';
import { TokenWidget, Icons } from '@/components/ui';

export function TokensPage() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [history, setHistory] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, h] = await Promise.all([api.getTokenBalance(), api.getTokenHistory()]);
        setBalance(b);
        setHistory(h);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="page-loader">{t('common.loading')}</div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h1 className="page__title">{t('tokens.title')}</h1>
        <TokenWidget />
      </div>
      <p className="page__subtitle">{t('tokens.subtitle')}</p>

      {balance && (
        <div className="hero" style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>{t('tokens.balance')}</div>
            <div style={{ fontSize: 48, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icons.balance size={40} /> {balance.balance}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16, fontSize: 12, opacity: 0.8 }}>
              <span>{t('tokens.earned', { amount: balance.total_earned })}</span>
              <span>{t('tokens.spent', { amount: balance.total_spent })}</span>
            </div>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>
        {t('tokens.history')}
      </h3>

      <div className="token-history">
        {history.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{t('tokens.no_transactions')}</p>
        )}
        {history.map((tx) => (
          <div key={tx.id} className="token-row">
            <div className="token-row__info">
              <span className="token-row__type">{tx.description || tx.type}</span>
              <span className="token-row__desc">{new Date(tx.created_at).toLocaleDateString()}</span>
            </div>
            <span className={`token-row__amount ${tx.amount > 0 ? 'token-row__amount--positive' : 'token-row__amount--negative'}`}>
              {tx.amount > 0 ? '+' : ''}{tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
