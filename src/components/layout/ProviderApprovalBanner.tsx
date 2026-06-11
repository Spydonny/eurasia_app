import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/ui';

/**
 * Read-only notice for organization/partner accounts that are not yet approved.
 * While pending/rejected, the backend rejects all provider write actions (403),
 * so this banner makes that state explicit and sets expectations.
 */
export function ProviderApprovalBanner() {
  const { t } = useTranslation();
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== 'organization' && user.role !== 'partner') return null;

  const status = user.provider_status ?? 'approved';
  if (status === 'approved') return null;

  const kind = user.role === 'organization' ? 'organization' : 'partner';

  if (status === 'rejected') {
    return (
      <div className="alert alert--error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icons.error size={18} />
        <span>{t('provider_approval.rejected', { kind })}</span>
      </div>
    );
  }

  // pending / none
  return (
    <div className="alert alert--warning" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Icons.pending size={18} />
      <span>{t('provider_approval.pending', { kind })}</span>
    </div>
  );
}
