import { useRouter } from 'expo-router';

import {
  useCategories,
  useSupplierLookup,
  useSupplierOutstanding,
  useSuppliers,
} from '@/features/deliveries/api/deliveries.queries';
import { useExpiringLicenses } from '@/features/licenses/api/licenses.queries';
import { useDailySummaryByDate } from '@/features/money/api/money.queries';
import { useDaySources } from '@/features/money/hooks/useDaySources';
import { usePersonName } from '@/features/money/hooks/usePersonName';
import { useScratchGames } from '@/features/scratch/api/scratch.queries';
import { useTasks, useTickets } from '@/features/work/api/work.queries';
import { today, yesterday } from '@/utils/businessDate';
import { formatMoney } from '@/utils/money';

import { useShopStaff } from '../api/shops.queries';
import { ShopLink } from '../utils/shopDay';
import { buildNeedsYou, buildTeamToday, setupSteps } from '../utils/today';
import { useCapabilities, useShopId } from './useShopContext';

/**
 * All of Today for one shop, from existing endpoints only. Each section
 * keeps its own query state so one failing never blanks the page; query
 * keys are shared, so a delivery loaded here is not loaded twice.
 */
export function useToday(enabled = true) {
  const router = useRouter();
  const routeShopId = useShopId();
  // Disabled (e.g. the tab badge for staff): every query is switched off.
  const shopId = enabled ? routeShopId : '';
  const caps = useCapabilities();
  const day = today();
  const prev = yesterday();

  const sources = useDaySources(shopId, day);
  const summary = useDailySummaryByDate(shopId, day);
  const prevSummary = useDailySummaryByDate(shopId, prev);
  const tasks = useTasks(shopId);
  const tickets = useTickets(shopId, { status: 'OPEN' });
  const owed = useSupplierOutstanding(shopId);
  const licences = useExpiringLicenses(shopId);
  const staff = useShopStaff(caps.canManageTeam ? shopId : null);
  const supplier = useSupplierLookup(shopId);
  const nameOf = usePersonName(shopId);

  // Setup basics (owner only); cheap, cached lists.
  const games = useScratchGames(caps.canManageShop ? shopId : '');
  const suppliers = useSuppliers(caps.canManageShop ? shopId : '');
  const categories = useCategories(caps.canManageShop ? shopId : '');
  const setupReady =
    games.isSuccess &&
    suppliers.isSuccess &&
    categories.isSuccess &&
    staff.isSuccess;
  const setup =
    caps.canManageShop && setupReady
      ? setupSteps({
          games: games.data?.length ?? 0,
          suppliers: suppliers.data?.length ?? 0,
          categories: categories.data?.length ?? 0,
          staff: staff.data?.length ?? 0,
        })
      : [];

  const openTickets = tickets.data?.tickets ?? [];
  const unassignedIssues = openTickets.filter(
    (t) => t.type === 'ISSUE' && !t.assigneeId,
  ).length;
  const owedCents = caps.canViewPayments
    ? (owed.data ?? []).reduce((n, b) => n + b.outstandingCents, 0)
    : null;

  const needsYou = buildNeedsYou({
    yesterday: prev,
    prevLoaded: prevSummary.isSuccess,
    prevSummary: prevSummary.data,
    shortSuppliers: sources.shortSupplierIds.map(
      (id) => supplier(id)?.name ?? 'Supplier',
    ),
    unassignedIssues,
    ticketsTotal: tickets.data?.total ?? 0,
    owedCents,
    licences: licences.data ?? [],
    formatMoney: (c) => formatMoney(c),
  });

  const team = buildTeamToday(
    tasks.data?.tasks ?? [],
    (staff.data ?? []).filter((m) => m.isActive),
    day,
  );

  const todayUnpaid = sources.deliveries.reduce(
    (n, d) => n + (d.totalAmountCents - d.totalPaidCents),
    0,
  );

  const go = (link: ShopLink) =>
    router.push({
      pathname: `/shop/[shopId]/${link.path}`,
      params: { shopId, ...link.params },
    });

  return {
    caps,
    day,
    prev,
    sources,
    summary,
    prevSummary,
    tasks,
    tickets,
    staff,
    needsYou,
    team,
    setup,
    unassignedIssues,
    openTicketCount: tickets.data?.total ?? 0,
    todayUnpaid,
    nameOf,
    go,
    refresh: () =>
      Promise.all([
        sources.refetch(),
        summary.refetch(),
        prevSummary.refetch(),
        tasks.refetch(),
        tickets.refetch(),
        licences.refetch(),
        ...(caps.canViewPayments ? [owed.refetch()] : []),
        ...(caps.canManageTeam ? [staff.refetch()] : []),
      ]),
  };
}
