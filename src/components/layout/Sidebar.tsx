import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/types';
import { getNavItemsForRole } from '@/config/navigation';
import { Icons } from '@/components/ui';

export function Sidebar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navItems = getNavItemsForRole(user?.role);

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img src="/logo_short.png" alt="" className="sidebar__logo" />
          <h1 className="sidebar__title">{t('app.name')}</h1>
        </div>
        <span className="sidebar__subtitle">{t('app.subtitle')}</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon className="sidebar__link-icon" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div>
          <span className="sidebar__user-name">{user?.username || t('common.guest')}</span>
          <span className="sidebar__user-role">{user ? ROLE_LABELS[user.role] : <Icons.privacy size={12} />}</span>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={logout}>
          {t('common.logout')}
        </button>
      </div>
    </aside>
  );
}
