import { IconName } from '@/components/AppIcon';

import { Bar, Capabilities } from './capabilities';

export type ShopTab = {
  name: string;
  title: string;
  icon: IconName;
  visible: boolean;
};

type Route = { name: string; title: string; icon: IconName; bars: Bar[] };

/**
 * Every shop tab route, in one declaration order that yields each bar's
 * order as a subsequence:
 *   oversight  → Today · Work · Finance · Records · More
 *   supervisor → Shift · Till · Deliveries · Work · More
 *   staff      → Shift · Scratch · Deliveries · Work · More
 * All routes stay registered so deep links keep working; only visibility
 * changes with the role. team/insights/home/money are retired tabs, kept
 * hidden so existing links still resolve.
 */
const ROUTES: Route[] = [
  { name: 'today', title: 'Today', icon: 'House', bars: ['oversight'] },
  {
    name: 'shift',
    title: 'Shift',
    icon: 'ClipboardCheck',
    bars: ['supervisor', 'staff'],
  },
  { name: 'till', title: 'Till', icon: 'Banknote', bars: ['supervisor'] },
  { name: 'scratch', title: 'Scratch', icon: 'Ticket', bars: ['staff'] },
  {
    name: 'deliveries',
    title: 'Deliveries',
    icon: 'Truck',
    bars: ['supervisor', 'staff'],
  },
  {
    name: 'work',
    title: 'Work',
    icon: 'ListChecks',
    bars: ['oversight', 'supervisor', 'staff'],
  },
  { name: 'finance', title: 'Finance', icon: 'ChartLine', bars: ['oversight'] },
  { name: 'records', title: 'Records', icon: 'FolderOpen', bars: ['oversight'] },
  {
    name: 'more',
    title: 'More',
    icon: 'Ellipsis',
    bars: ['oversight', 'supervisor', 'staff'],
  },
  { name: 'team', title: 'Team', icon: 'UsersRound', bars: [] },
  { name: 'insights', title: 'Insights', icon: 'ChartLine', bars: [] },
  { name: 'home', title: 'Home', icon: 'House', bars: [] },
  { name: 'money', title: 'Money', icon: 'Wallet', bars: [] },
];

export function shopTabsFor(caps: Capabilities): ShopTab[] {
  return ROUTES.map(({ bars, ...t }) => ({
    ...t,
    visible: bars.includes(caps.bar),
  }));
}
