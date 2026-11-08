import { useRouter } from 'expo-router';
import React from 'react';

import { IconName } from '@/components/AppIcon';
import { ListItem, ListSection } from '@/components/ListItem';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { today } from '@/utils/businessDate';

type Row = {
  icon: IconName;
  title: string;
  subtitle: string;
  path: string;
  params?: Record<string, string>;
};

const DAILY: Row[] = [
  {
    icon: 'CalendarCheck',
    title: 'Day close',
    subtitle: "Count the till and finalize today's summary",
    path: 'close-day',
  },
  {
    icon: 'Banknote',
    title: 'Till',
    subtitle: 'Cash in and out, expected balance',
    path: 'records/till',
  },
  {
    icon: 'Ticket',
    title: 'Scratch',
    subtitle: 'Packs, scans and sales',
    path: 'records/scratch',
  },
  {
    icon: 'Truck',
    title: 'Deliveries',
    subtitle: 'Stock received and supplier payments',
    path: 'records/deliveries',
  },
  {
    icon: 'Receipt',
    title: 'Expenses',
    subtitle: 'Bills and running costs',
    path: 'expenses',
  },
];

const REFERENCE: Row[] = [
  {
    icon: 'BadgeCheck',
    title: 'Licences',
    subtitle: 'Expiry dates and renewals',
    path: 'licenses',
  },
  {
    icon: 'ClipboardList',
    title: 'Forms',
    subtitle: 'Checklists, reports and their answers',
    path: 'forms',
  },
  {
    icon: 'Factory',
    title: 'Suppliers',
    subtitle: 'Who delivers to this hok',
    path: 'suppliers',
  },
  {
    icon: 'Tags',
    title: 'Categories',
    subtitle: 'Group suppliers by what they sell',
    path: 'categories',
  },
];

/**
 * Records (owners and managers): an index of the shop's books. Daily
 * records first, then reference. Shop settings live in the header ⋯ menu
 * and people on the Team tab, so neither is repeated here.
 */
export default function RecordsScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const open = (r: Row) =>
    router.push({
      pathname: `/shop/[shopId]/${r.path}`,
      params: {
        shopId,
        ...(r.path === 'close-day' ? { date: today() } : {}),
        ...r.params,
      },
    });

  const section = (title: string, rows: Row[]) => (
    <ListSection title={title}>
      {rows.map((r) => (
        <ListItem
          key={r.path}
          icon={r.icon}
          title={r.title}
          subtitle={r.subtitle}
          onPress={() => open(r)}
        />
      ))}
    </ListSection>
  );

  return (
    <ShopTabScreen title='Records'>
      {section('Daily', DAILY)}
      {section('Reference', REFERENCE)}
    </ShopTabScreen>
  );
}
