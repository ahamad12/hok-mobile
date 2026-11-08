import { IconName } from '@/components/AppIcon';

import { Capabilities } from './capabilities';

export type ShopTab = {
  name: string;
  title: string;
  icon: IconName;
  visible: boolean;
};

/**
 * Every shop tab route, in one declaration order that yields both shells'
 * bar order as a subsequence:
 *   oversight → Today · Work · Team · Insights · Records
 *   shift     → Shift · [Till] · Scratch · Deliveries · Tasks
 * All routes are always registered (deep links keep working); only
 * visibility changes with the role. home/money/more are the old tabs, kept
 * hidden so existing links still resolve.
 */
export function shopTabsFor(caps: Capabilities): ShopTab[] {
  const oversight = caps.shell === 'oversight';
  const shift = !oversight;
  return [
    { name: 'today', title: 'Today', icon: 'House', visible: oversight },
    { name: 'shift', title: 'Shift', icon: 'ClipboardCheck', visible: shift },
    {
      name: 'till',
      title: 'Till',
      icon: 'Banknote',
      visible: shift && caps.canUseTill,
    },
    { name: 'scratch', title: 'Scratch', icon: 'Ticket', visible: shift },
    { name: 'deliveries', title: 'Deliveries', icon: 'Truck', visible: shift },
    {
      name: 'work',
      title: oversight ? 'Work' : 'Tasks',
      icon: 'ListChecks',
      visible: true,
    },
    { name: 'team', title: 'Team', icon: 'UsersRound', visible: oversight },
    {
      name: 'insights',
      title: 'Insights',
      icon: 'ChartLine',
      visible: oversight,
    },
    {
      name: 'records',
      title: 'Records',
      icon: 'FolderOpen',
      visible: oversight,
    },
    { name: 'home', title: 'Home', icon: 'House', visible: false },
    { name: 'money', title: 'Money', icon: 'Wallet', visible: false },
    { name: 'more', title: 'More', icon: 'Ellipsis', visible: false },
  ];
}
