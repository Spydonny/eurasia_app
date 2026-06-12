import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/config/navigation';
import { Icons } from '@/components/ui';

/** Max real tabs shown in the bar before collapsing the rest into "More". */
const MAX_PRIMARY = 4;

export function BottomNav() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const navItems = getNavItemsForRole(user?.role);
  const needsMore = navItems.length > MAX_PRIMARY + 1;
  const primary = needsMore ? navItems.slice(0, MAX_PRIMARY) : navItems;
  const overflow = needsMore ? navItems.slice(MAX_PRIMARY) : [];

  // "More" is highlighted when the active route lives in the overflow bucket.
  const moreActive = overflow.some(
    (item) => item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path),
  );

  // Close the sheet whenever the route changes (e.g. after tapping a link).
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [sheetOpen]);

  return (
    <>
      <nav className="bottom-nav">
        {primary.map((item) => {
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

        {needsMore && (
          <button
            type="button"
            className={`bottom-nav__link bottom-nav__more ${moreActive ? 'bottom-nav__link--active' : ''}`}
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <Icons.navMore className="bottom-nav__icon" size={22} />
            <span className="bottom-nav__label">{t('nav.more')}</span>
          </button>
        )}
      </nav>

      {needsMore && sheetOpen && (
        <div className="nav-sheet" role="dialog" aria-modal="true">
          <button
            type="button"
            className="nav-sheet__backdrop"
            aria-label={t('common.cancel')}
            onClick={() => setSheetOpen(false)}
          />
          <div className="nav-sheet__panel">
            <div className="nav-sheet__handle" />
            <div className="nav-sheet__header">
              <span className="nav-sheet__title">{t('nav.more')}</span>
              <button
                type="button"
                className="nav-sheet__close"
                aria-label={t('common.cancel')}
                onClick={() => setSheetOpen(false)}
              >
                <Icons.close size={20} />
              </button>
            </div>

            <div className="nav-sheet__grid">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `nav-sheet__item ${isActive ? 'nav-sheet__item--active' : ''}`
                    }
                  >
                    <Icon className="nav-sheet__item-icon" size={24} />
                    <span className="nav-sheet__item-label">{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
            </div>

            <button className="btn btn--ghost nav-sheet__logout" onClick={logout}>
              {t('common.logout')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
