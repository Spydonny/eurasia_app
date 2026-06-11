export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: 'badge' | 'title' | 'powerup' | 'customization';
  price: number;
  icon: string;
  available: boolean;
  owned: boolean;
}

export interface Purchase {
  id: string;
  item_id: string;
  item_name: string;
  item_type: string;
  icon: string;
  price_paid: number;
  created_at: string;
}

export const ITEM_TYPE_LABELS: Record<string, string> = {
  badge: 'Badges',
  title: 'Titles',
  powerup: 'Power-ups',
  customization: 'Customization',
};

export const ITEM_TYPE_ICONS: Record<string, string> = {
  badge: '🏅',
  title: '👑',
  powerup: '⚡',
  customization: '🎨',
};
