import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import { DailySummary } from '@/features/money/api/money.types';
import { expectedClosing } from '@/features/money/utils/reconcile';
import { HeroCard } from '@/features/shops/components/HeroCard';
import { QuickActions } from '@/features/shops/components/QuickActions';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { useSinceLastSeen } from '@/features/shops/hooks/useSinceLastSeen';
import { useToday } from '@/features/shops/hooks/useToday';
import { capped } from '@/features/shops/utils/today';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';
import { formatBusinessDay, parseBusinessDate } from '@/utils/businessDate';
import { formatMoney, formatSignedMoney } from '@/utils/money';

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

const storedExpected = (s: DailySummary) =>
  expectedClosing({
    openingBalance: s.openingBalance,
    totalCashIn: s.totalCashIn,
    totalCashOut: s.totalCashOut,
    scratchRevenue: s.scratchRevenue,
    deliveryExpense: s.deliveryExpense,
    otherIncome: s.otherIncome,
    otherExpense: s.otherExpense,
  });

/**
 * Today (owners and managers): one decision at the top (the day close),
 * shortcuts for covering the counter, then compact sections that inform. Every row is one tap from its
 * detail; only the hero has a button. Each section loads and fails alone.
 */
export default function TodayScreen() {
  const router = useRouter();
  const { colors } = useColors();
  const t = useToday();
  const since = useSinceLastSeen(useShopId());
  const s = t.summary.data;
  const prev = t.prevSummary.data;
  const prevOpen = t.prevSummary.isSuccess && prev?.status !== 'FINALIZED';

  const dateLabel = parseBusinessDate(t.day).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const retry = (label: string, onPress: () => void) => (
    <ListItem
      icon='CloudOff'
      title={`Couldn't load ${label}`}
      subtitle='Tap to try again'
      onPress={onPress}
    />
  );

  // The hero: what the day close needs from you right now.
  const hero = (() => {
    if (t.summary.isLoading) return null;
    if (!s) {
      return {
        lines: [
          `Scratch so far ${formatMoney(t.sources.aggregates.scratchRevenue)}`,
          `Expected so far ${formatMoney(expectedClosing(t.sources.aggregates))}`,
        ],
        by: 'Not closed yet',
        action: t.caps.canDraftDay ? 'Count & close' : null,
        onPress: () => t.go({ path: 'close-day', params: { date: t.day } }),
      };
    }
    const open = () =>
      t.go({ path: 'day/[summaryId]', params: { summaryId: s.id } });
    if (s.status === 'DRAFT') {
      return {
        by: `Draft by ${t.nameOf(s.createdById)} · ${timeOf(s.createdAt)}`,
        lines: [
          `Expected ${formatMoney(storedExpected(s))}   Actual ${formatMoney(s.closingBalance)}`,
          `Variance ${formatSignedMoney(s.variance)}`,
        ],
        action: t.caps.canFinalizeDay ? 'Review & finalize' : 'View',
        onPress: open,
      };
    }
    return {
      by: `Closed ✓ by ${t.nameOf(s.finalizedById)}`,
      lines: [`Variance ${formatSignedMoney(s.variance)}`],
      action: 'Open summary',
      onPress: open,
    };
  })();

  const needsYou = t.needsYou.filter((r) => r.key !== 'yesterday');
  const scansDone =
    (t.sources.morningScans > 0 ? 1 : 0) + (t.sources.eveningScans > 0 ? 1 : 0);

  return (
    <ShopTabScreen
      title='Today'
      subtitle={since ? `${dateLabel} · ${since}` : dateLabel}
      onRefresh={t.refresh}>
      {prevOpen ? (
        <Pressable
          onPress={() =>
            t.go(
              prev
                ? { path: 'day/[summaryId]', params: { summaryId: prev.id } }
                : { path: 'close-day', params: { date: t.prev } },
            )
          }
          accessibilityRole='button'>
          <AppText
            variant='body'
            weight='semibold'
            customColor={palette.hok.rust}>
            {prev ? "Yesterday's draft waiting ›" : 'Yesterday not closed ›'}
          </AppText>
        </Pressable>
      ) : null}

      {hero === null ? (
        <SkeletonRow />
      ) : (
        <HeroCard
          context={`Day close · ${formatBusinessDay(t.day)}`}
          title={hero.by}
          lines={hero.lines}
          action={hero.action}
          quiet={hero.action === 'Open summary' || hero.action === 'View'}
          onAction={hero.onPress}
        />
      )}

      <QuickActions
        actions={[
          {
            key: 'scan',
            icon: 'ScanLine',
            label: 'Scan',
            onPress: () => t.go({ path: 'records/scratch' }),
          },
          {
            key: 'delivery',
            icon: 'Truck',
            label: 'Delivery',
            onPress: () => t.go({ path: 'deliveries/new' }),
          },
          {
            key: 'till',
            icon: 'Banknote',
            label: 'Till entry',
            onPress: () => t.go({ path: 'till/new' }),
          },
          {
            key: 'task',
            icon: 'ListPlus',
            label: 'Task',
            onPress: () => t.go({ path: 'tasks/new' }),
          },
        ]}
      />

      {t.setup.length > 0 ? (
        <ListSection title='Set up this hok'>
          {t.setup.map((step) => (
            <ListItem
              key={step.key}
              icon='CirclePlus'
              iconTone='brand'
              title={step.title}
              subtitle={step.subtitle}
              onPress={() => t.go({ path: step.path })}
            />
          ))}
        </ListSection>
      ) : (
        <>
          <ListSection title='Needs you'>
            {needsYou.length === 0 ? (
              <ListItem
                icon='Check'
                iconTone='success'
                title='All clear'
                chevron={false}
              />
            ) : (
              needsYou.map((r) => (
                <ListItem
                  key={r.key}
                  icon={r.icon}
                  iconTone={r.tone}
                  title={r.title}
                  subtitle={r.subtitle}
                  onPress={() => t.go(r.link)}
                />
              ))
            )}
          </ListSection>

          <ListSection title='Today so far'>
            {t.sources.loading ? (
              <SkeletonRow />
            ) : t.sources.scansFailed ? (
              retry('today', () => t.sources.refetch())
            ) : (
              <>
                <ListItem
                  icon='Ticket'
                  title='Scratch'
                  subtitle={`${formatMoney(t.sources.aggregates.scratchRevenue)} · ${t.sources.ticketsSold} tickets · ${scansDone}/2 scans`}
                  onPress={() => t.go({ path: 'records/scratch' })}
                />
                <ListItem
                  icon='Truck'
                  title='Deliveries'
                  subtitle={[
                    `${t.sources.deliveries.length} received`,
                    t.sources.shortDeliveries
                      ? `${t.sources.shortDeliveries} short`
                      : null,
                    t.caps.canViewPayments && t.todayUnpaid
                      ? `${formatMoney(t.todayUnpaid)} owed`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  onPress={() => t.go({ path: 'records/deliveries' })}
                />
                <ListItem
                  icon='Receipt'
                  title='Expenses'
                  subtitle={`${formatMoney(t.sources.aggregates.otherExpense)} · ${t.sources.expenses.length} ${t.sources.expenses.length === 1 ? 'entry' : 'entries'}`}
                  onPress={() => t.go({ path: 'expenses' })}
                />
              </>
            )}
          </ListSection>
        </>
      )}

      {t.caps.canManageTeam ? (
        <ListSection title='Team today'>
          {t.tasks.isLoading ? (
            <SkeletonRow />
          ) : t.tasks.isError ? (
            retry('tasks', () => t.tasks.refetch())
          ) : (
            <>
              <ListItem
                icon='ListChecks'
                title='Tasks'
                subtitle={`Done ${t.team.done} · Open ${capped(t.team.open, t.tasks.data?.total)} · Overdue ${t.team.overdue}`}
                onPress={() =>
                  t.go({ path: 'work', params: { view: 'tasks' } })
                }
              />
              {t.team.people.map((p) => (
                <ListItem
                  key={p.id}
                  leading={
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: p.overdue
                            ? palette.hok.rust
                            : colors.border.subtle,
                        },
                      ]}
                    />
                  }
                  title={p.name}
                  subtitle={`${p.open} open${p.overdue ? ` · ${p.overdue} overdue` : ''}`}
                  onPress={() =>
                    router.push({
                      pathname: '/people/[userId]',
                      params: { userId: p.id },
                    })
                  }
                />
              ))}
              <ListItem
                icon='MessageSquare'
                title='Tickets'
                subtitle={`${capped(t.openTicketCount)} open · ${t.unassignedIssues} unassigned`}
                onPress={() =>
                  t.go({ path: 'work', params: { view: 'tickets' } })
                }
              />
            </>
          )}
          {t.staff.data?.length ? (
            <ListItem
              title={`All staff (${t.staff.data.length})`}
              onPress={() => t.go({ path: 'staff' })}
            />
          ) : null}
        </ListSection>
      ) : null}
    </ShopTabScreen>
  );
}

const styles = StyleSheet.create({
  dot: { width: 10, height: 10, marginHorizontal: spacing[2] },
});
