import type { UserRole } from '@/types';
import { Icons, type IconType } from '@/components/ui/icons';

export interface NavItem {
  labelKey: string;
  path: string;
  icon: IconType;
}

const VOLUNTEER_NAV: NavItem[] = [
  { labelKey: 'nav.home', path: '/', icon: Icons.navDashboard },
  { labelKey: 'nav.missions', path: '/missions', icon: Icons.navMissions },
  { labelKey: 'nav.events', path: '/events', icon: Icons.navEvents },
  { labelKey: 'nav.rewards', path: '/rewards', icon: Icons.redeem },
  { labelKey: 'nav.marketplace', path: '/marketplace', icon: Icons.navMarketplace },
  { labelKey: 'nav.chats', path: '/chats', icon: Icons.navChat },
  { labelKey: 'nav.friends', path: '/friends', icon: Icons.navFriends },
  { labelKey: 'nav.achievements', path: '/achievements', icon: Icons.reward },
  { labelKey: 'nav.leaderboard', path: '/leaderboard', icon: Icons.ranking },
  { labelKey: 'nav.tokens', path: '/tokens', icon: Icons.navTokens },
  { labelKey: 'nav.profile', path: '/profile', icon: Icons.navProfile },
];

const ORGANIZATION_NAV: NavItem[] = [
  { labelKey: 'nav.home', path: '/', icon: Icons.navDashboard },
  { labelKey: 'nav.events', path: '/events', icon: Icons.navEvents },
  { labelKey: 'nav.chats', path: '/chats', icon: Icons.navChat },
  { labelKey: 'nav.organization', path: '/profile', icon: Icons.organization },
];

const PARTNER_NAV: NavItem[] = [
  { labelKey: 'nav.home', path: '/', icon: Icons.navDashboard },
  { labelKey: 'nav.rewards', path: '/rewards', icon: Icons.redeem },
  { labelKey: 'nav.partner', path: '/profile', icon: Icons.partner },
];

const ADMIN_NAV: NavItem[] = [
  { labelKey: 'nav.home', path: '/', icon: Icons.navDashboard },
  { labelKey: 'nav.events', path: '/events', icon: Icons.navEvents },
  { labelKey: 'nav.admin', path: '/admin', icon: Icons.navAdmin },
  { labelKey: 'nav.tokens', path: '/tokens', icon: Icons.navTokens },
  { labelKey: 'nav.profile', path: '/profile', icon: Icons.navProfile },
];

export function getNavItemsForRole(role: UserRole | undefined): NavItem[] {
  switch (role) {
    case 'organization':
      return ORGANIZATION_NAV;
    case 'partner':
      return PARTNER_NAV;
    case 'admin':
      return ADMIN_NAV;
    default:
      return VOLUNTEER_NAV;
  }
}

export function getHomePathForRole(role: UserRole | undefined): string {
  switch (role) {
    case 'organization':
    case 'partner':
      // Provider profile/dashboard now lives under /profile.
      return '/profile';
    default:
      return '/';
  }
}
