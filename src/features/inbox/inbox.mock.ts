// SAMPLE DATA. tapt-api has no tenant-wide attention endpoint yet
// (a proposed GET /tenant/attention), and the app does not fan out over
// every shop to fake one. Until that endpoint exists, the Inbox tab shows
// these generated items, built on the user's real shops so tapping one
// lands on a real screen in that shop. The screen labels them as sample.

import { IconName } from '@/components/AppIcon';
import { Shop } from '@/features/shops/api/shops.types';

export type InboxSeverity = 'high' | 'medium' | 'low';

/** Where tapping an item goes, inside the item's shop. */
export type InboxTarget = 'home' | 'work' | 'money' | 'licenses' | 'scratch';

export type InboxItem = {
  id: string;
  shopId: string;
  title: string;
  detail: string;
  severity: InboxSeverity;
  icon: IconName;
  target: InboxTarget;
  assignedToMe: boolean;
};

export type InboxGroup = { shop: Shop; items: InboxItem[] };

const TEMPLATES: Omit<InboxItem, 'id' | 'shopId'>[] = [
  {
    title: 'Yesterday not closed',
    detail: 'Close the day to reconcile the till',
    severity: 'high',
    icon: 'CalendarX2',
    target: 'money',
    assignedToMe: false,
  },
  {
    title: 'Fridge not cooling',
    detail: 'Issue · High priority',
    severity: 'high',
    icon: 'TriangleAlert',
    target: 'work',
    assignedToMe: true,
  },
  {
    title: 'Acknowledge: new opening hours',
    detail: 'Instruction needs your acknowledgement',
    severity: 'medium',
    icon: 'Megaphone',
    target: 'work',
    assignedToMe: true,
  },
  {
    title: '2 tasks overdue',
    detail: 'Oldest was due 2 days ago',
    severity: 'medium',
    icon: 'ListTodo',
    target: 'work',
    assignedToMe: false,
  },
  {
    title: 'Licence expiring in 9 days',
    detail: 'Lottery retailer licence',
    severity: 'low',
    icon: 'BadgeCheck',
    target: 'licenses',
    assignedToMe: false,
  },
  {
    title: 'Evening scan not recorded',
    detail: 'Scratch packs on display',
    severity: 'low',
    icon: 'ScanLine',
    target: 'scratch',
    assignedToMe: false,
  },
];

const RANK: Record<InboxSeverity, number> = { high: 0, medium: 1, low: 2 };

/** Stable per shop: the same shop always gets the same sample items. */
function sampleFor(shop: Shop, index: number): InboxItem[] {
  const seed = [...shop.id].reduce((n, ch) => n + ch.charCodeAt(0), index);
  const count = seed % 4; // 0–3 items; some shops are all clear
  return Array.from({ length: count }, (_, i) => {
    const t = TEMPLATES[(seed + i * 2) % TEMPLATES.length];
    return { ...t, id: `${shop.id}:${i}`, shopId: shop.id };
  });
}

/**
 * Groups sorted by item count (busiest shop first); items by severity.
 * `mine` keeps only items assigned to the user.
 */
export function buildSampleInbox(shops: Shop[], mine: boolean): InboxGroup[] {
  return shops
    .map((shop, i) => ({
      shop,
      items: sampleFor(shop, i)
        .filter((it) => !mine || it.assignedToMe)
        .sort((a, b) => RANK[a.severity] - RANK[b.severity]),
    }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length);
}

export const countItems = (groups: InboxGroup[]) =>
  groups.reduce((n, g) => n + g.items.length, 0);
