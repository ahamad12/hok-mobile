import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { ListItem, ListSection } from '@/components/ListItem';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SkeletonRow } from '@/components/Skeleton';
import { StatTile } from '@/components/StatTile';
import { useVoidScan } from '@/features/scratch/api/scratch.mutations';
import {
  useGameLookup,
  useScratchPacks,
  useScratchScans,
} from '@/features/scratch/api/scratch.queries';
import {
  PackFilters,
  ScratchScan,
  ShiftPeriod,
} from '@/features/scratch/api/scratch.types';
import {
  gameTitle,
  packSubtitle,
  SHIFT_LABEL,
  shiftProgress,
} from '@/features/scratch/utils/scratchUtils';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { today } from '@/utils/businessDate';
import { formatMoney } from '@/utils/money';
import { formatRelativeTime } from '@/utils/time';

type View_ = 'packs' | 'scans';
type PackTab = 'display' | 'backstock' | 'finished' | 'returned';

const PACK_FILTERS: Record<PackTab, PackFilters> = {
  display: { status: 'ACTIVE', location: 'DISPLAY' },
  backstock: { status: 'ACTIVE', location: 'BACKSTOCK' },
  finished: { status: 'FINISHED' },
  returned: { status: 'RETURNED' },
};

export default function ScratchScreen({
  pushed = false,
}: {
  /** Opened from Records rather than as a tab. */
  pushed?: boolean;
}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ shift?: ShiftPeriod }>();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const reason = useRef<ReasonSheetRef>(null);

  const [view, setView] = useState<View_>('packs');
  const [packTab, setPackTab] = useState<PackTab>('display');
  // Arriving from the day card: "scan morning" / "scan evening".
  const [scanShift, setScanShift] = useState<ShiftPeriod | undefined>(
    params.shift,
  );
  useEffect(() => {
    if (params.shift) {
      setScanShift(params.shift);
      setView('packs');
      setPackTab('display');
    }
  }, [params.shift]);

  const day = today();
  const game = useGameLookup(shopId);
  const packs = useScratchPacks(shopId, PACK_FILTERS[packTab]);
  const displayTotal = useScratchPacks(shopId, PACK_FILTERS.display).data
    ?.total;
  const scans = useScratchScans(shopId, day);
  const voidScan = useVoidScan(shopId);
  const progress = shiftProgress(scans.data ?? []);

  const go = (path: string, extra: Record<string, string> = {}) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...extra },
    });

  const openPack = (packId: string) =>
    go(
      'scratch/pack/[packId]',
      scanShift ? { packId, shift: scanShift } : { packId },
    );

  const askVoid = (s: ScratchScan) =>
    reason.current?.ask({
      title: 'Void this scan?',
      message:
        'Its sales stop counting. Only the latest scan of a pack can be voided; scan it again afterwards.',
      confirmLabel: 'Void scan',
      onConfirm: (r) =>
        voidScan
          .mutateAsync({ id: s.id, reason: r })
          .then(() => toast.success('Scan voided')),
    });

  const actions = [
    ...(manages
      ? [
          {
            icon: 'Gamepad2' as const,
            label: 'Games',
            onPress: () => go('scratch/games'),
          },
        ]
      : []),
    {
      icon: 'PackagePlus' as const,
      label: 'Receive pack',
      onPress: () => go('scratch/receive'),
    },
  ];

  const scanned =
    scanShift === 'EVENING'
      ? progress.evening.packIds
      : progress.morning.packIds;

  return (
    <ShopTabScreen
      pushed={pushed}
      title='Scratch'
      actions={actions}
      onRefresh={() => Promise.all([packs.refetch(), scans.refetch()])}>
      <View style={styles.tiles}>
        <StatTile
          label='Sold today'
          value={formatMoney(progress.revenueCents)}
          hint={`${progress.ticketsSold} tickets`}
          loading={scans.isLoading}
        />
        <StatTile
          label='On display'
          value={displayTotal === undefined ? '–' : String(displayTotal)}
          hint={`Morning ${progress.morning.count} · Evening ${progress.evening.count}`}
        />
      </View>

      <SegmentedControl<View_>
        value={view}
        onChange={setView}
        options={[
          { value: 'packs', label: 'Packs' },
          {
            value: 'scans',
            label: "Today's scans",
            count: scans.data?.filter((s) => !s.voidedAt).length,
          },
        ]}
      />

      {view === 'packs' ? (
        <>
          <FilterChips<PackTab>
            value={packTab}
            onChange={setPackTab}
            options={[
              { value: 'display', label: 'On display' },
              { value: 'backstock', label: 'Backstock' },
              { value: 'finished', label: 'Finished' },
              { value: 'returned', label: 'Returned' },
            ]}
          />
          {scanShift && packTab === 'display' ? (
            <SegmentedControl<ShiftPeriod>
              value={scanShift}
              onChange={setScanShift}
              options={[
                { value: 'MORNING', label: 'Scanning morning' },
                { value: 'EVENING', label: 'Scanning evening' },
              ]}
            />
          ) : null}
          {packs.isLoading ? (
            <ListSection>
              <SkeletonRow />
              <SkeletonRow />
            </ListSection>
          ) : (packs.data?.packs.length ?? 0) === 0 ? (
            <EmptyState
              icon='Ticket'
              title={
                packTab === 'display' ? 'No packs on display' : 'Nothing here'
              }
              body={
                packTab === 'display'
                  ? 'Receive a pack, or move one out of backstock.'
                  : undefined
              }
              actionLabel={packTab === 'display' ? 'Receive pack' : undefined}
              actionIcon='PackagePlus'
              onAction={() => go('scratch/receive')}
            />
          ) : (
            <ListSection
              footer={
                scanShift && packTab === 'display'
                  ? `Tap a pack to record its ${SHIFT_LABEL[scanShift].toLowerCase()} serial.`
                  : undefined
              }>
              {packs.data?.packs.map((p) => {
                const g = game(p.gameId);
                const done =
                  packTab === 'display' && scanShift
                    ? scanned.has(p.id)
                    : false;
                return (
                  <ListItem
                    key={p.id}
                    icon={done ? 'CircleCheck' : 'Ticket'}
                    iconTone={done ? 'success' : 'neutral'}
                    title={gameTitle(g)}
                    subtitle={packSubtitle(p, g)}
                    value={g ? formatMoney(g.priceCents) : undefined}
                    onPress={() => openPack(p.id)}
                  />
                );
              })}
            </ListSection>
          )}
        </>
      ) : scans.isLoading ? (
        <ListSection>
          <SkeletonRow />
        </ListSection>
      ) : (scans.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon='ScanLine'
          title='No scans yet today'
          body='Open a pack on display and record its serial.'
        />
      ) : (
        (['MORNING', 'EVENING'] as const).map((shift) => {
          const rows = (scans.data ?? []).filter(
            (s) => s.shiftPeriod === shift,
          );
          if (rows.length === 0) return null;
          return (
            <ListSection key={shift} title={SHIFT_LABEL[shift]}>
              {rows.map((s) => (
                <ListItem
                  key={s.id}
                  icon='ScanLine'
                  iconTone={s.voidedAt ? 'error' : 'neutral'}
                  title={gameTitle(game(s.gameId))}
                  subtitle={`Serial ${s.scannedSerial} · ${s.ticketsSoldSincePrevious} sold · ${formatRelativeTime(s.createdAt)}`}
                  value={s.voidedAt ? undefined : formatMoney(s.revenueCents)}
                  trailing={
                    s.voidedAt ? (
                      <Badge label='Voided' tone='error' />
                    ) : undefined
                  }
                  onPress={
                    manages && !s.voidedAt ? () => askVoid(s) : undefined
                  }
                  chevron={false}>
                  {s.voidReason ? (
                    <Badge label={s.voidReason} style={styles.reason} />
                  ) : null}
                </ListItem>
              ))}
            </ListSection>
          );
        })
      )}
      <ReasonSheet ref={reason} />
    </ShopTabScreen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: spacing[3] },
  reason: { alignSelf: 'flex-start', marginTop: 4 },
});
