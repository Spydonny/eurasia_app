/**
 * Eurasia — unified icon set (single source of truth).
 *
 * Every action / entity / state maps to ONE fixed phosphor-react icon.
 * Rules:
 *   - Never use different icons for the same meaning.
 *   - States over visual variety.
 *   - Circle = neutral / unread / inactive.
 *   - CheckCircle = success / verified / completed.
 *   - XCircle = error / rejected / failed.
 *   - Clock = pending / scheduled.
 *   - Strictly phosphor-react. No custom SVGs, no decorative icons.
 *
 * Substitutions (icon not present in phosphor-react@1.4.x):
 *   - Verified: CheckBadge → CheckCircle (per rule "CheckCircle = verified")
 *   - Moderation: Gavel → Scales
 *   - Empty state: Inbox → Tray
 */
import {
  House, Calendar, Target, Wallet, Storefront, Chats, Users, Bell, User, ShieldStar,
  SignIn, UserPlus, SlidersHorizontal, ArrowRight, ArrowLeft, CheckCircle, XCircle,
  CalendarBlank, PlusCircle, PencilSimple, Check, X, UsersThree, MapPin, Clock, Globe,
  Gauge, Trophy, ShieldCheck, Coins, Receipt, ArrowDown, ArrowUp, ArrowsDownUp,
  Package, ShoppingCart, Tag, Gift, ChatCircle, PaperPlaneRight, Paperclip, Circle,
  DotsThree, UserMinus, Prohibit, MagnifyingGlass, Gear, Lock, Activity, BellRinging,
  Info, Warning, Minus, Buildings, Handshake, ChartBar, Scales, Flag, FileText,
  ChartLine, Trash, SpinnerGap, Tray, Medal, Confetti,
  Leaf, GraduationCap, Heartbeat, PawPrint, Palette, SoccerBall, Laptop, DotsThreeCircle,
} from 'phosphor-react';

/** A phosphor-react icon component type. */
export type IconType = typeof House;

/**
 * Semantic icon registry. Use members directly in JSX, e.g. `<Icons.navEvents />`,
 * or reference the component for config: `icon: Icons.navEvents`.
 * Keys are unique; multiple meanings intentionally share the same glyph.
 */
export const Icons = {
  // ── Global navigation ──
  navDashboard: House,
  navEvents: Calendar,
  navMissions: Target,
  navTokens: Wallet,
  navMarketplace: Storefront,
  navChat: Chats,
  navFriends: Users,
  navNotifications: Bell,
  navProfile: User,
  navAdmin: ShieldStar,

  // ── Auth / Onboarding ──
  login: SignIn,
  register: UserPlus,
  onboarding: SlidersHorizontal,
  next: ArrowRight,
  back: ArrowLeft,

  // ── Events ──
  eventList: CalendarBlank,
  eventDetail: Calendar,
  eventCreate: PlusCircle,
  eventEdit: PencilSimple,
  eventJoin: Check,
  eventLeave: X,
  participants: UsersThree,
  location: MapPin,
  time: Clock,
  online: Globe,

  // ── Missions ──
  mission: Target,
  progress: Gauge,
  reward: Trophy,
  verification: ShieldCheck,

  // ── Tokens / Wallet ──
  wallet: Wallet,
  balance: Coins,
  transactions: Receipt,
  incoming: ArrowDown,
  outgoing: ArrowUp,
  transfer: ArrowsDownUp,

  // ── Marketplace / Rewards ──
  marketplace: Storefront,
  item: Package,
  buy: ShoppingCart,
  tag: Tag,
  redeem: Gift,
  available: Check,
  soldOut: X,

  // ── Chat ──
  chatList: Chats,
  conversation: ChatCircle,
  send: PaperPlaneRight,
  attach: Paperclip,
  onlineStatus: Circle,
  typing: DotsThree,

  // ── Friends / Social ──
  friends: Users,
  addFriend: UserPlus,
  removeFriend: UserMinus,
  block: Prohibit,
  search: MagnifyingGlass,

  // ── Profile ──
  profile: User,
  edit: PencilSimple,
  settings: Gear,
  privacy: Lock,
  verified: CheckCircle, // substitute for CheckBadge
  activity: Activity,

  // ── Notifications ──
  notifications: Bell,
  unread: BellRinging,
  info: Info,

  // ── Achievements ──
  achievement: Trophy,
  badge: Medal,
  celebrate: Confetti,

  // ── Leaderboard ──
  ranking: Trophy,
  rankUp: ArrowUp,
  rankDown: ArrowDown,
  rankStable: Minus,

  // ── Organization / Partner ──
  organization: Buildings,
  partner: Handshake,
  dashboard: ChartBar,
  members: Users,

  // ── Admin ──
  admin: ShieldStar,
  moderation: Scales, // substitute for Gavel
  users: Users,
  reports: Flag,
  logs: FileText,
  analytics: ChartLine,
  delete: Trash,

  // ── Universal states ──
  loading: SpinnerGap,
  empty: Tray, // substitute for Inbox
  success: CheckCircle,
  error: XCircle,
  warning: Warning,
  pending: Clock,
  rejected: XCircle,
  completed: CheckCircle,
  approval: CheckCircle,
  neutral: Circle,
} as const satisfies Record<string, IconType>;

export type IconName = keyof typeof Icons;

/** Event category → fixed icon (deterministic, replaces category emoji). */
export const CategoryIcons: Record<string, IconType> = {
  environment: Leaf,
  education: GraduationCap,
  health: Heartbeat,
  animals: PawPrint,
  culture: Palette,
  sports: SoccerBall,
  technology: Laptop,
  social: Handshake,
  other: DotsThreeCircle,
};

/** User role → fixed icon. */
export const RoleIcons: Record<string, IconType> = {
  volunteer: Leaf,
  organization: Buildings,
  partner: Handshake,
  admin: ShieldStar,
};
