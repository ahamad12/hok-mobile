import { useRouter } from 'expo-router';
import React from 'react';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { useLicenses } from '@/features/licenses/api/licenses.queries';
import { LicenseBadge } from '@/features/licenses/components/LicenseBadge';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { formatShortDate } from '@/utils/time';

function LicensesScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const licenses = useLicenses(shopId);

  // Most urgent first: expired, then fewest days left.
  const list = [...(licenses.data?.licenses ?? [])].sort(
    (a, b) =>
      Number(b.isActive) - Number(a.isActive) ||
      Number(b.isExpired) - Number(a.isExpired) ||
      (a.daysRemaining ?? 99999) - (b.daysRemaining ?? 99999),
  );

  return (
    <FormScreen
      title='Licences'
      footer={
        manages ? (
          <AppButton
            iconLeft='Plus'
            fullWidth
            onPress={() =>
              router.push({
                pathname: '/shop/[shopId]/licenses/new',
                params: { shopId },
              })
            }>
            Add licence
          </AppButton>
        ) : undefined
      }>
      {licenses.isLoading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : list.length === 0 ? (
        <EmptyState
          icon='BadgeCheck'
          title='No licences yet'
          body='Track trade, lottery, tobacco and other licences, and get reminded before they expire.'
        />
      ) : (
        <ListSection>
          {list.map((l) => (
            <ListItem
              key={l.id}
              icon='BadgeCheck'
              iconTone={
                l.isExpired ? 'error' : l.isExpiringSoon ? 'warning' : 'neutral'
              }
              title={l.productName}
              subtitle={`${l.licenseNumber}${l.currentExpiryDate ? ` · expires ${formatShortDate(l.currentExpiryDate)}` : ''}`}
              trailing={<LicenseBadge license={l} />}
              onPress={() =>
                router.push({
                  pathname: '/shop/[shopId]/licenses/[licenseId]',
                  params: { shopId, licenseId: l.id },
                })
              }
            />
          ))}
        </ListSection>
      )}
    </FormScreen>
  );
}

export default withPageAccess('licenses', 'Licences', LicensesScreen);
