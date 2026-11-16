import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ListItem, ListSection } from '@/components/ListItem';
import { StatTile } from '@/components/StatTile';
import { useExpiringLicenses } from '@/features/licenses/api/licenses.queries';
import {
  useDailySummaryByDate,
  useTillSummary,
} from '@/features/money/api/money.queries';
import { DailySummary } from '@/features/money/api/money.types';
import { dayStatus } from '@/features/money/utils/moneyUtils';
import {
  useScratchPacks,
  useScratchScans,
} from '@/features/scratch/api/scratch.queries';
import { shiftProgress } from '@/features/scratch/utils/scratchUtils';
import { DayCard, DayStep } from '@/features/shops/components/DayCard';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useTasks, useTickets } from '@/features/work/api/work.queries';
import { spacing } from '@/theme/Common';
import {
  formatBusinessDay,
  parseBusinessDate,
  today,
  yesterday,
} from '@/utils/businessDate';
import { formatMoney } from '@/utils/money';

/**
 * Home only summarizes and routes. Each block is its own feature query
 * (scans, daily summary, till, tasks, tickets, licences) for this one shop.
 */
export default function ShopHomeScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const role = useShopRole();
  const day = today();
  const prev = yesterday();

  const scans = useScratchScans(shopId, day);
  const displayPacks = useScratchPacks(shopId, {
    status: 'ACTIVE',
    location: 'DISPLAY',
  });
  const summary = useDailySummaryByDate(shopId, day);
  const prevSummary = useDailySummaryByDate(shopId, prev);
  const till = useTillSummary(shopId, day);
  const overdue = useTasks(shopId, { isOverdue: true });
  const openTickets = useTickets(shopId, { status: 'OPEN' });
  const licences = useExpiringLicenses(shopId);

  const progress = shiftProgress(scans.data ?? []);
  const go = (path: string, params: Record<string, string> = {}) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...params },
    });

  const openSummary = (s: DailySummary) =>
    go('day/[summaryId]', { summaryId: s.id });
  const onStep = (step: DayStep) => {
    if (step === 'close') go('close-day', { date: day });
    else go('scratch', { shift: step === 'morning' ? 'MORNING' : 'EVENING' });
  };

  const refresh = () =>
    Promise.all([
      scans.refetch(),
      displayPacks.refetch(),
      summary.refetch(),
      prevSummary.refetch(),
      till.refetch(),
      overdue.refetch(),
      openTickets.refetch(),
      licences.refetch(),
    ]);

  // Real attention items for this shop, most severe first.
  const attention: React.ReactElement[] = [];
  const prevStatus = dayStatus(prevSummary.data);
  if (prevSummary.isSuccess && prevStatus !== 'closed') {
    attention.push(
      <ListItem
        key='prev'
        icon='CalendarX2'
        iconTone='error'
        title={
          prevStatus === 'draft'
            ? 'Yesterday is still a draft'
            : 'Yesterday not closed'
        }
        subtitle={
          prevStatus === 'draft'
            ? role.canFinalize
              ? 'Review and finalize it'
              : 'Waiting for an owner or manager'
            : 'Close it so the till carries over'
        }
        onPress={() =>
          prevSummary.data
            ? openSummary(prevSummary.data)
            : role.canDraftClose
              ? go('close-day', { date: prev })
              : go('money')
        }
      />,
    );
  }
  const overdueCount = overdue.data?.total ?? 0;
  if (overdueCount > 0) {
    attention.push(
      <ListItem
        key='overdue'
        icon='ListTodo'
        iconTone='warning'
        title={`${overdueCount} ${overdueCount === 1 ? 'task' : 'tasks'} overdue`}
        subtitle='Past their due date'
        onPress={() => go('work', { view: 'tasks', filter: 'overdue' })}
      />,
    );
  }
  const ticketCount = openTickets.data?.total ?? 0;
  if (ticketCount > 0) {
    const urgent = openTickets.data?.tickets.filter(
      (t) => t.priority === 'URGENT' || t.priority === 'HIGH',
    ).length;
    attention.push(
      <ListItem
        key='tickets'
        icon='MessageSquareWarning'
        iconTone={urgent ? 'error' : 'warning'}
        title={`${ticketCount} open ${ticketCount === 1 ? 'ticket' : 'tickets'}`}
        subtitle={
          urgent
            ? `${urgent} high priority`
            : 'Issues, instructions and announcements'
        }
        onPress={() => go('work', { view: 'tickets' })}
      />,
    );
  }
  for (const l of licences.data ?? []) {
    attention.push(
      <ListItem
        key={l.id}
        icon='BadgeCheck'
        iconTone={l.isExpired ? 'error' : 'warning'}
        title={
          l.isExpired
            ? `${l.productName} licence expired`
            : `${l.productName} licence · ${l.daysRemaining} days left`
        }
        subtitle={l.licenseNumber}
        onPress={() => go('licenses/[licenseId]', { licenseId: l.id })}
      />,
    );
  }

  const dateLabel = `${formatBusinessDay(day)} · ${parseBusinessDate(
    day,
  ).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })}`;

  return (
    <ShopTabScreen title='Home' onRefresh={refresh}>
      <DayCard
        dateLabel={dateLabel}
        loading={scans.isLoading || summary.isLoading}
        morningScans={progress.morning.count}
        eveningScans={progress.evening.count}
        displayPacks={displayPacks.data?.total}
        summary={summary.data}
        canDraftClose={role.canDraftClose}
        canFinalize={role.canFinalize}
        onStep={onStep}
        onOpenSummary={openSummary}
      />

      <View style={styles.tiles}>
        <StatTile
          label='Scratch today'
          value={formatMoney(progress.revenueCents)}
          hint={`${progress.ticketsSold} tickets`}
          loading={scans.isLoading}
          onPress={() => go('scratch')}
        />
        <StatTile
          label='Till expected'
          value={formatMoney(till.data?.expectedClosingBalance)}
          hint={
            till.data
              ? `Opened at ${formatMoney(till.data.openingBalance)}`
              : undefined
          }
          loading={till.isLoading}
          onPress={() => go('money')}
        />
      </View>

      {attention.length > 0 ? (
        <ListSection title='Needs attention'>{attention}</ListSection>
      ) : null}

      <ListSection title='Quick actions'>
        <ListItem
          icon='CirclePlus'
          title='Add till entry'
          subtitle='Sale, payout, cash in or out'
          onPress={() => go('till/new')}
        />
        <ListItem
          icon='ListPlus'
          title='New task'
          onPress={() => go('tasks/new')}
        />
        <ListItem
          icon='MessageSquarePlus'
          title='Report an issue'
          onPress={() => go('tickets/new', { type: 'ISSUE' })}
        />
        <ListItem
          icon='Truck'
          title='Record a delivery'
          onPress={() => go('deliveries/new')}
        />
      </ListSection>
    </ShopTabScreen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing[3] },
});
