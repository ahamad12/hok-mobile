import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import {
  useDeliveries,
  useSupplierLookup,
  useSupplierOutstanding,
} from '@/features/deliveries/api/deliveries.queries';
import { PaymentStatus } from '@/features/deliveries/api/deliveries.types';
import { PAYMENT_STATUS } from '@/features/deliveries/utils/deliveryUtils';
import {
  ScreenMode,
  ShopScreenFrame,
} from '@/features/shops/components/ShopScreenFrame';
import {
  useCapabilities,
  useShopId,
} from '@/features/shops/hooks/useShopContext';
import { formatMoney } from '@/utils/money';
import { formatShortDate } from '@/utils/time';

/** 'PENDING' = waiting to be checked in; the rest are payment states. */
type Tab = 'all' | 'PENDING' | PaymentStatus;

export default function DeliveriesScreen({
  mode = 'pushed',
}: {
  mode?: ScreenMode;
}) {
  const router = useRouter();
  const shopId = useShopId();
  // Staff log deliveries; owners and managers see what is owed and paid.
  const { canViewPayments } = useCapabilities();
  const [tab, setTab] = useState<Tab>('all');
  const deliveries = useDeliveries(
    shopId,
    tab === 'all'
      ? {}
      : tab === 'PENDING'
        ? { status: 'PENDING' }
        : { paymentStatus: tab },
  );
  const outstanding = useSupplierOutstanding(shopId);
  const supplier = useSupplierLookup(shopId);

  const owed = (outstanding.data ?? []).filter((b) => b.outstandingCents > 0);
  const go = (path: string, extra: Record<string, string> = {}) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...extra },
    });

  return (
    <ShopScreenFrame
      mode={mode}
      title='Deliveries'
      action={{
        icon: 'Plus',
        label: 'Record delivery',
        onPress: () => go('deliveries/new'),
      }}>
      {canViewPayments && owed.length > 0 ? (
        <ListSection title='Owed to suppliers'>
          {owed.map((b) => (
            <ListItem
              key={b.supplierId}
              icon='Factory'
              title={supplier(b.supplierId)?.name ?? 'Supplier'}
              subtitle={`Paid ${formatMoney(b.totalPaidCents)} of ${formatMoney(b.totalAmountCents)}`}
              value={formatMoney(b.outstandingCents)}
            />
          ))}
        </ListSection>
      ) : null}

      <FilterChips<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'all', label: 'All' },
          { value: 'PENDING', label: 'To check in' },
          ...(canViewPayments
            ? ([
                { value: 'UNPAID', label: 'Unpaid' },
                { value: 'PARTIAL', label: 'Part paid' },
                { value: 'PAID', label: 'Paid' },
              ] as const)
            : []),
        ]}
      />

      {deliveries.isLoading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : (deliveries.data?.deliveries.length ?? 0) === 0 ? (
        <EmptyState
          icon='Truck'
          title='No deliveries'
          body={
            tab === 'all'
              ? 'Record stock as it arrives, with what you received.'
              : undefined
          }
        />
      ) : (
        <ListSection>
          {deliveries.data?.deliveries.map((d) => {
            const st = PAYMENT_STATUS[d.paymentStatus];
            const toCheckIn = d.status === 'PENDING' && !d.voidedAt;
            return (
              <ListItem
                key={d.id}
                icon='Truck'
                iconTone={d.voidedAt ? 'error' : 'neutral'}
                title={supplier(d.supplierId)?.name ?? 'Supplier'}
                subtitle={`${formatShortDate(d.deliveredAt)} · ${formatMoney(d.totalAmountCents)}`}
                trailing={
                  toCheckIn ? (
                    <Badge label='To check in' tone='warning' />
                  ) : d.voidedAt || canViewPayments ? (
                    <Badge
                      label={d.voidedAt ? 'Voided' : st.label}
                      tone={d.voidedAt ? 'neutral' : st.tone}
                    />
                  ) : undefined
                }
                onPress={() =>
                  go('deliveries/[deliveryId]', { deliveryId: d.id })
                }
              />
            );
          })}
        </ListSection>
      )}
    </ShopScreenFrame>
  );
}
