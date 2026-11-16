import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createDailySummary,
  createExpense,
  createExpenseCategory,
  createTillEntry,
  finalizeDailySummary,
  reverseTillEntry,
  updateExpenseCategory,
  voidDailySummary,
  voidExpense,
} from './money.api';
import {
  CreateDailySummaryInput,
  CreateExpenseInput,
  CreateTillEntryInput,
  DailySummary,
} from './money.types';
import { moneyKeys } from './query-keys';

/** Till, summaries and P&L all derive from each other: refresh the shop. */
const useInvalidateMoney = (shopId: string) => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: moneyKeys.shop(shopId) });
};

export const useCreateTillEntry = (shopId: string) => {
  const invalidate = useInvalidateMoney(shopId);
  return useMutation({
    mutationFn: (input: Omit<CreateTillEntryInput, 'shopId'>) =>
      createTillEntry({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: invalidate,
  });
};

export const useReverseTillEntry = (shopId: string) => {
  const invalidate = useInvalidateMoney(shopId);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reverseTillEntry(id, reason),
    onSuccess: invalidate,
  });
};

export const useCreateDailySummary = (shopId: string) => {
  const qc = useQueryClient();
  const invalidate = useInvalidateMoney(shopId);
  return useMutation({
    mutationFn: (input: Omit<CreateDailySummaryInput, 'shopId'>) =>
      createDailySummary({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: (s) => {
      qc.setQueryData(moneyKeys.summary(s.id), s);
      return invalidate();
    },
  });
};

const useSummaryChange = <V>(
  shopId: string,
  fn: (vars: V) => Promise<DailySummary>,
) => {
  const qc = useQueryClient();
  const invalidate = useInvalidateMoney(shopId);
  return useMutation({
    mutationFn: fn,
    onSuccess: (s) => {
      qc.setQueryData(moneyKeys.summary(s.id), s);
      return invalidate();
    },
  });
};

export const useFinalizeDailySummary = (shopId: string) =>
  useSummaryChange(shopId, (id: string) => finalizeDailySummary(id));

export const useVoidDailySummary = (shopId: string) =>
  useSummaryChange(shopId, ({ id, reason }: { id: string; reason: string }) =>
    voidDailySummary(id, reason),
  );

export const useCreateExpense = (shopId: string) => {
  const invalidate = useInvalidateMoney(shopId);
  return useMutation({
    mutationFn: (input: Omit<CreateExpenseInput, 'shopId'>) =>
      createExpense({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: invalidate,
  });
};

export const useVoidExpense = (shopId: string) => {
  const invalidate = useInvalidateMoney(shopId);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      voidExpense(id, reason),
    onSuccess: invalidate,
  });
};

export const useCreateExpenseCategory = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      createExpenseCategory({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moneyKeys.expenseCategories(shopId) }),
  });
};

export const useUpdateExpenseCategory = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      isActive?: boolean;
    }) => updateExpenseCategory(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moneyKeys.expenseCategories(shopId) }),
  });
};
