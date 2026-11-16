import { useRouter } from 'expo-router';
import React from 'react';

import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useDailySummaryByDate } from '@/features/money/api/money.queries';
import { useDaySources } from '@/features/money/hooks/useDaySources';
import { expectedClosing } from '@/features/money/utils/reconcile';
import { useScratchScans } from '@/features/scratch/api/scratch.queries';
import { HeroCard } from '@/features/shops/components/HeroCard';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import {
  useCapabilities,
  useShopId,
} from '@/features/shops/hooks/useShopContext';
import { buildForYou, buildShiftHero } from '@/features/shops/utils/shift';
import { ShopLink } from '@/features/shops/utils/shopDay';
import { useTasks, useTickets } from '@/features/work/api/work.queries';
import { formatBusinessDay, today } from '@/utils/businessDate';
import { formatMoney } from '@/utils/money';

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

/**
 * Shift. Supervisor: one action hero, the Till card, For you. Staff: one
 * action hero (morning and evening scans only) and For you, with no money
 * anywhere. Inline buttons only on the hero and the Till card.
 */
export default function ShiftScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const caps = useCapabilities();
  const me = useUser()?.id ?? '';
  const day = today();

  const scans = useScratchScans(shopId, day);
  // Plain staff never load the day's close.
  const summary = useDailySummaryByDate(caps.canDraftDay ? shopId : '', day);
  const tasks = useTasks(shopId);
  const tickets = useTickets(shopId);

  const live = (scans.data ?? []).filter((s) => !s.voidedAt);
  const s = summary.data;
  const hero = buildShiftHero({
    today: day,
    morningScans: live.filter((x) => x.shiftPeriod === 'MORNING').length,
    eveningScans: live.filter((x) => x.shiftPeriod === 'EVENING').length,
    canClose: caps.canDraftDay,
    summary: s,
    submittedAt: s ? timeOf(s.createdAt) : undefined,
  });
  const forYou = buildForYou(
    tasks.data?.tasks ?? [],
    tickets.data?.tickets ?? [],
    me,
    day,
  );

  const go = (link: ShopLink) =>
    router.push({
      pathname: `/shop/[shopId]/${link.path}`,
      params: { shopId, ...link.params },
    });

  return (
    <ShopTabScreen
      title='Shift'
      subtitle={formatBusinessDay(day)}
      onRefresh={() =>
        Promise.all([
          scans.refetch(),
          tasks.refetch(),
          tickets.refetch(),
          ...(caps.canDraftDay ? [summary.refetch()] : []),
        ])
      }>
      {scans.isLoading ? (
        <SkeletonRow />
      ) : (
        <HeroCard
          context={hero.done ? 'Your shift' : 'Next'}
          title={hero.title}
          lines={[hero.subtitle]}
          action={hero.action}
          onAction={hero.link ? () => go(hero.link!) : undefined}
          onPress={!hero.action && hero.link ? () => go(hero.link!) : undefined}
        />
      )}

      {caps.canUseTill ? (
        <TillCard shopId={shopId} day={day} onGo={go} />
      ) : null}

      <ListSection title='For you'>
        {tasks.isLoading ? (
          <SkeletonRow />
        ) : tasks.isError ? (
          <ListItem
            icon='CloudOff'
            title="Couldn't load your work"
            subtitle='Tap to try again'
            onPress={() => tasks.refetch()}
          />
        ) : forYou.length === 0 ? (
          <ListItem
            icon='Check'
            iconTone='success'
            title='Nothing due for you'
            chevron={false}
          />
        ) : (
          forYou.map((r) => (
            <ListItem
              key={r.key}
              icon={r.icon}
              iconTone={r.tone}
              title={r.title}
              subtitle={r.subtitle}
              onPress={() => go(r.link)}
            />
          ))
        )}
      </ListSection>
    </ShopTabScreen>
  );
}

/**
 * Supervisor's till: the reconciled expected closing (the server formula,
 * not the till-only figure), cash in and out, and one button to add an
 * entry. Tapping the card opens the Till tab.
 */
function TillCard({
  shopId,
  day,
  onGo,
}: {
  shopId: string;
  day: string;
  onGo: (link: ShopLink) => void;
}) {
  const d = useDaySources(shopId, day);
  if (d.loading) return <SkeletonRow />;
  const a = d.aggregates;
  return (
    <HeroCard
      context='Till'
      title={`Expected closing ${formatMoney(expectedClosing(a))}`}
      lines={[
        `In ${formatMoney(a.totalCashIn)} · Out ${formatMoney(a.totalCashOut)}`,
      ]}
      action='Add entry'
      quiet
      onAction={() => onGo({ path: 'till/new' })}
      onPress={() => onGo({ path: 'till' })}
    />
  );
}
