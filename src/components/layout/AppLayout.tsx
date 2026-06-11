import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ProviderApprovalBanner } from './ProviderApprovalBanner';
import { NotificationBell } from '@/components/notifications';
import { LanguageSwitcher, Icons } from '@/components/ui';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-layout__main">
        <div className="app-layout__topbar">
          <LanguageSwitcher />
          <div className="app-layout__actions">
            <NotificationBell />
            <Link to="/tokens" className="token-badge" aria-label="Wallet">
              <Icons.navTokens size={22} />
            </Link>
          </div>
        </div>
        <ProviderApprovalBanner />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
