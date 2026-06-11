import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/config/navigation';

export function BottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navItems = getNavItemsForRole(user?.role);

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
            }
          >
            <Icon className="bottom-nav__icon" size={22} />
            <span className="bottom-nav__label">{t(item.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
