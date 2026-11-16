import { useQueries, useQuery } from '@tanstack/react-query';

import { useIsSignedIn, useUser } from '@/features/auth/hooks/useAuth';
import { addDays } from '@/utils/businessDate';

import {
  getDailySummaries,
  getDailySummary,
  getDailySummaryByDate,
  getExpenseCategories,
  getExpenses,
  getProfitPreview,
  getTillEntries,
  getTillSummary,
} from './money.api';
import { DailySummaryStatus } from './money.types';
import { moneyKeys } from './query-keys';

const useIsManagerOrOwner = () => {
  const role = useUser()?.role;
  return role === 'OWNER' || role === 'MANAGER';
};

export const useTillSummary = (shopId: string, date: string) =>
  useQuery({
    queryKey: moneyKeys.tillSummary(shopId, date),
    queryFn: () => getTillSummary(shopId, date),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useTillEntries = (shopId: string, from?: string, to?: string) =>
  useQuery({
    queryKey: moneyKeys.tillEntries(shopId, from, to),
    queryFn: () => getTillEntries(shopId, { dateFrom: from, dateTo: to }),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useDailySummaries = (
  shopId: string,
  status?: DailySummaryStatus,
) =>
  useQuery({
    queryKey: moneyKeys.summaryList(shopId, status),
    queryFn: () => getDailySummaries(shopId, { status }),
    enabled: useIsSignedIn() && !!shopId,
  });

/** `null` = the day has no summary yet (not started). */
export const useDailySummaryByDate = (shopId: string, date: string) =>
  useQuery({
    queryKey: moneyKeys.summaryByDate(shopId, date),
    queryFn: () => getDailySummaryByDate(shopId, date),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useDailySummary = (id?: string) =>
  useQuery({
    queryKey: moneyKeys.summary(id ?? ''),
    queryFn: () => getDailySummary(id as string),
    enabled: useIsSignedIn() && !!id,
  });

/** OWNER/MANAGER only; disabled for staff. */
export const useExpenseCategories = (shopId: string) => {
  const signedIn = useIsSignedIn();
  const manages = useIsManagerOrOwner();
  return useQuery({
    queryKey: moneyKeys.expenseCategories(shopId),
    queryFn: () => getExpenseCategories(shopId),
    enabled: signedIn && !!shopId && manages,
    staleTime: 1000 * 60 * 10,
  });
};

/** OWNER/MANAGER only; disabled for staff. */
export const useExpenses = (shopId: string, from?: string, to?: string) => {
  const signedIn = useIsSignedIn();
  const manages = useIsManagerOrOwner();
  return useQuery({
    queryKey: moneyKeys.expenses(shopId, from, to),
    queryFn: () => getExpenses(shopId, { dateFrom: from, dateTo: to }),
    enabled: signedIn && !!shopId && manages,
  });
};

export const useProfitPreview = (
  shopId: string,
  from: string,
  to: string,
  enabled = true,
) =>
  useQuery({
    queryKey: moneyKeys.profit(shopId, from, to),
    queryFn: () => getProfitPreview(shopId, from, to),
    enabled: useIsSignedIn() && !!shopId && enabled,
    staleTime: 1000 * 60 * 5,
  });

/**
 * Recent daily summaries for many shops at once (Your hoks). Same key as
 * useDailySummaries, so opening a shop reuses what this loaded.
 */
export const useShopsDailySummaries = (shopIds: string[]) => {
  const signedIn = useIsSignedIn();
  return useQueries({
    queries: shopIds.map((shopId) => ({
      queryKey: moneyKeys.summaryList(shopId, undefined),
      queryFn: () => getDailySummaries(shopId, {}),
      enabled: signedIn && !!shopId,
    })),
  });
};

/**
 * Closing balance of the latest non-voided summary before `day`: the
 * opening the server will use when this day is created (findLatestBefore).
 * `null` when there is none (the server opens at 0).
 */
export const useLatestCloseBefore = (shopId: string, day: string) =>
  useQuery({
    queryKey: [...moneyKeys.summaryList(shopId, undefined), 'before', day],
    queryFn: async () => {
      const prev = addDays(day, -1);
      const res = await getDailySummaries(shopId, { dateTo: prev });
      return res.summaries[0]?.closingBalance ?? null;
    },
    enabled: useIsSignedIn() && !!shopId,
  });
