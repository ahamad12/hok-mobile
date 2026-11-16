import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { ListItem, ListSection } from '@/components/ListItem';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import { SkeletonRow } from '@/components/Skeleton';
import { StatTile } from '@/components/StatTile';
import { useReverseTillEntry } from '@/features/money/api/money.mutations';
import {
  useDailySummaryByDate,
  useTillEntries,
  useTillSummary,
} from '@/features/money/api/money.queries';
import { TillEntry } from '@/features/money/api/money.types';
import {
  DAY_STATUS,
  dayStatus,
  TILL_CATEGORY,
  tillMovement,
} from '@/features/money/utils/moneyUtils';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { today } from '@/utils/businessDate';
import { formatMoney, formatSignedMoney } from '@/utils/money';

export default function MoneyScreen({
  pushed = false,
}: {
  /** Opened from Records rather than as a tab. */
  pushed?: boolean;
}) {
  const router = useRouter();
  const shopId = useShopId();
  const { manages, canDraftClose } = useShopRole();
  const toast = useToast();
  const reason = useRef<ReasonSheetRef>(null);

  const day = today();
  // Till figures are point-in-time for one day; trends live in Insights.
  const till = useTillSummary(shopId, day);
  const entries = useTillEntries(shopId, day, day);
  const todaySummary = useDailySummaryByDate(shopId, day);
  const reverse = useReverseTillEntry(shopId);

  const go = (path: string, extra: Record<string, string> = {}) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...extra },
    });

  const reversedIds = new Set(
    (entries.data?.entries ?? []).map((e) => e.reversesEntryId).filter(Boolean),
  );

  const askReverse = (e: TillEntry) =>
    reason.current?.ask({
      title: 'Reverse this entry?',
      message: `Adds a correcting entry for ${formatMoney(e.amount)}. The original stays on record.`,
      confirmLabel: 'Reverse',
      minLength: 1,
      onConfirm: (r) =>
        reverse
          .mutateAsync({ id: e.id, reason: r })
          .then(() => toast.success('Entry reversed')),
    });

  const status = dayStatus(todaySummary.data);

  return (
    <ShopTabScreen
      pushed={pushed}
      title='Till'
      actions={[
        {
          icon: 'Plus',
          label: 'Add till entry',
          onPress: () => go('till/new'),
        },
      ]}
      onRefresh={() =>
        Promise.all([till.refetch(), entries.refetch(), todaySummary.refetch()])
      }>
      <View style={styles.tiles}>
        <StatTile
          label='Expected in till'
          value={formatMoney(till.data?.expectedClosingBalance)}
          hint={
            till.data
              ? `Opened ${formatMoney(till.data.openingBalance)}`
              : undefined
          }
          loading={till.isLoading}
        />
      </View>
      <View style={styles.tiles}>
        <StatTile
          label='Cash in'
          value={formatMoney(till.data?.totalCashIn)}
          tone='success'
          loading={till.isLoading}
        />
        <StatTile
          label='Cash out'
          value={formatMoney(till.data?.totalCashOut)}
          loading={till.isLoading}
        />
      </View>

      <ListSection title='Today'>
        <ListItem
          icon='CalendarCheck'
          title='Close the day'
          subtitle={
            status === 'not_started'
              ? canDraftClose
                ? 'Count the till and save the day'
                : 'An owner, manager or supervisor closes the day'
              : status === 'draft'
                ? 'Draft saved'
                : 'Finalized'
          }
          trailing={
            <Badge
              label={DAY_STATUS[status].label}
              tone={DAY_STATUS[status].tone}
            />
          }
          onPress={
            todaySummary.data
              ? () =>
                  go('day/[summaryId]', { summaryId: todaySummary.data!.id })
              : canDraftClose
                ? () => go('close-day', { date: day })
                : undefined
          }
        />
      </ListSection>

      <ListSection title='Till entries today'>
        {entries.isLoading ? (
          <SkeletonRow />
        ) : (entries.data?.entries.length ?? 0) === 0 ? (
          <ListItem
            icon='Plus'
            title='No entries yet today'
            subtitle='Record sales, payouts and cash moved in or out'
            onPress={() => go('till/new')}
          />
        ) : (
          entries.data?.entries.map((e) => {
            const cat = TILL_CATEGORY[e.category];
            const isReversal = !!e.reversesEntryId;
            const wasReversed = reversedIds.has(e.id);
            return (
              <ListItem
                key={e.id}
                icon={isReversal ? 'Undo2' : cat.icon}
                iconTone={isReversal ? 'warning' : 'neutral'}
                title={isReversal ? `Reversal · ${cat.label}` : cat.label}
                subtitle={e.correctionReason ?? e.description ?? undefined}
                value={formatSignedMoney(tillMovement(e.category, e.amount))}
                trailing={wasReversed ? <Badge label='Reversed' /> : undefined}
                onPress={
                  manages && !isReversal && !wasReversed
                    ? () => askReverse(e)
                    : undefined
                }
                chevron={false}
              />
            );
          })
        )}
      </ListSection>

      <ReasonSheet ref={reason} />
    </ShopTabScreen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing[3] },
});
