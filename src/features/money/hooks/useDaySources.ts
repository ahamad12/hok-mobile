import {
  useDeliveries,
  useDeliveryDetails,
} from '@/features/deliveries/api/deliveries.queries';
import { useScratchScans } from '@/features/scratch/api/scratch.queries';

import {
  useExpenses,
  useLatestCloseBefore,
  useTillEntries,
  useTillSummary,
} from '../api/money.queries';
import { composeAggregates, onDay } from '../utils/reconcile';

/**
 * Everything one day's close is built from, filtered the way the server
 * filters it (UTC business date, voided rows excluded). Used by the review
 * page in both compose and read mode, and for the checks.
 */
export function useDaySources(shopId: string, day: string) {
  const till = useTillSummary(shopId, day);
  const entries = useTillEntries(shopId, day, day);
  const scans = useScratchScans(shopId, day);
  const allDeliveries = useDeliveries(shopId);
  const expenses = useExpenses(shopId, day, day);
  const previous = useLatestCloseBefore(shopId, day);

  const ofDay = onDay(
    allDeliveries.data?.deliveries ?? [],
    day,
    (d) => d.deliveredAt,
  );
  // Matches the server's day totals: only checked-in deliveries count;
  // PENDING ones can still change.
  const deliveries = ofDay.filter((d) => d.status !== 'PENDING');
  const pendingDeliveries = ofDay.length - deliveries.length;
  const details = useDeliveryDetails(deliveries.map((d) => d.id));
  const shortItems = details.reduce(
    (n, q) =>
      n + (q.data?.lineItems.filter((l) => l.hasDiscrepancy).length ?? 0),
    0,
  );
  // details[i] belongs to deliveries[i] (same order).
  const shortSupplierIds = deliveries
    .filter((_, i) =>
      // eslint-disable-next-line security/detect-object-injection
      details[i]?.data?.lineItems.some((l) => l.hasDiscrepancy),
    )
    .map((d) => d.supplierId);
  const shortDeliveries = shortSupplierIds.length;

  const dayExpenses = onDay(
    expenses.data?.expenses ?? [],
    day,
    (e) => e.expenseDate,
  );
  const liveScans = (scans.data ?? []).filter((s) => !s.voidedAt);
  const scratchBy = (shift: 'MORNING' | 'EVENING') =>
    liveScans
      .filter((s) => s.shiftPeriod === shift)
      .reduce((n, s) => n + s.revenueCents, 0);
  const tillEntries = entries.data?.entries ?? [];

  const aggregates = composeAggregates({
    previousClosing: previous.data ?? null,
    totalCashIn: till.data?.totalCashIn ?? 0,
    totalCashOut: till.data?.totalCashOut ?? 0,
    scratchRevenue: liveScans.reduce((n, s) => n + s.revenueCents, 0),
    deliveries,
    expenses: dayExpenses,
  });

  const loading =
    till.isLoading ||
    scans.isLoading ||
    allDeliveries.isLoading ||
    expenses.isLoading ||
    previous.isLoading;

  return {
    loading,
    aggregates,
    hasPrevious: previous.data !== null && previous.data !== undefined,
    tillEntries,
    reversals: tillEntries.filter((e) => e.reversesEntryId).length,
    morningScans: liveScans.filter((s) => s.shiftPeriod === 'MORNING').length,
    eveningScans: liveScans.filter((s) => s.shiftPeriod === 'EVENING').length,
    ticketsSold: liveScans.reduce((n, s) => n + s.ticketsSoldSincePrevious, 0),
    scansFailed: scans.isError,
    morningScratch: scratchBy('MORNING'),
    eveningScratch: scratchBy('EVENING'),
    deliveries,
    pendingDeliveries,
    shortItems,
    shortDeliveries,
    shortSupplierIds,
    expenses: dayExpenses,
    refetch: () =>
      Promise.all([
        till.refetch(),
        entries.refetch(),
        scans.refetch(),
        allDeliveries.refetch(),
        expenses.refetch(),
        previous.refetch(),
      ]),
  };
}

/**
 * Rows on the day added after a draft was saved: the draft's figures were
 * frozen at createdAt, so these are missing from it.
 */
export function addedSince(
  sources: ReturnType<typeof useDaySources>,
  since: string,
): number {
  const after = (r: { createdAt: string }) => r.createdAt > since;
  return (
    sources.tillEntries.filter(after).length +
    sources.expenses.filter(after).length +
    sources.deliveries.filter(after).length
  );
}
