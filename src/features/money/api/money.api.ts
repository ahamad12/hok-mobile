import axios from 'axios';

import { ENDPOINTS } from '@/constants/Endpoints';
import { apiGet, apiPatch, apiPost } from '@/services/apiRequest';

import {
  CreateDailySummaryInput,
  CreateExpenseInput,
  CreateTillEntryInput,
  DailySummary,
  DailySummaryStatus,
  Expense,
  ExpenseCategory,
  ProfitPreview,
  TillCategory,
  TillEntry,
  TillSummary,
} from './money.types';

const TILL = ENDPOINTS.TILL_ENTRIES;
const DS = ENDPOINTS.DAILY_SUMMARIES;

// ── Till ─────────────────────────────────────────────────────────────────

export const getTillEntries = (
  shopId: string,
  q: { category?: TillCategory; dateFrom?: string; dateTo?: string } = {},
) =>
  apiGet<{ entries: TillEntry[]; total: number }>(TILL.LIST, {
    shopId,
    limit: 100,
    ...q,
  });

/** Point-in-time: one business day. */
export const getTillSummary = (shopId: string, date: string) =>
  apiGet<TillSummary>(TILL.SUMMARY, { shopId, date });

export const createTillEntry = (input: CreateTillEntryInput) =>
  apiPost<TillEntry>(TILL.CREATE, input);

/** OWNER/MANAGER: appends a negating row; the original stays. */
export const reverseTillEntry = (id: string, correctionReason: string) =>
  apiPost<TillEntry>(TILL.REVERSE(id), { correctionReason });

// ── Daily summaries (closing the day) ────────────────────────────────────

export const getDailySummaries = (
  shopId: string,
  q: { status?: DailySummaryStatus; dateFrom?: string; dateTo?: string } = {},
) =>
  apiGet<{ summaries: DailySummary[]; total: number }>(DS.LIST, {
    shopId,
    limit: 30,
    ...q,
  });

/** The live summary for a day, or null when none exists (server 404). */
export async function getDailySummaryByDate(
  shopId: string,
  date: string,
): Promise<DailySummary | null> {
  try {
    return await apiGet<DailySummary>(DS.BY_DATE(shopId, date));
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export const getDailySummary = (id: string) =>
  apiGet<DailySummary>(DS.BY_ID(id));

/** OWNER/MANAGER, or a supervisor of that shop. One live draft per day (409). */
export const createDailySummary = (input: CreateDailySummaryInput) =>
  apiPost<DailySummary>(DS.CREATE, input);

/** OWNER/MANAGER only. */
export const finalizeDailySummary = (id: string) =>
  apiPost<DailySummary>(DS.FINALIZE(id));

/** OWNER/MANAGER only. */
export const voidDailySummary = (id: string, voidReason: string) =>
  apiPost<DailySummary>(DS.VOID(id), { voidReason });

// ── Expenses (OWNER/MANAGER) ─────────────────────────────────────────────

export async function getExpenseCategories(
  shopId: string,
): Promise<ExpenseCategory[]> {
  return (
    await apiGet<{ categories: ExpenseCategory[] }>(
      ENDPOINTS.EXPENSE_CATEGORIES.LIST,
      { shopId },
    )
  ).categories;
}

export const createExpenseCategory = (input: {
  shopId: string;
  name: string;
  description?: string;
}) => apiPost<ExpenseCategory>(ENDPOINTS.EXPENSE_CATEGORIES.CREATE, input);

export const updateExpenseCategory = (
  id: string,
  input: { name?: string; isActive?: boolean },
) => apiPatch<ExpenseCategory>(ENDPOINTS.EXPENSE_CATEGORIES.UPDATE(id), input);

export const getExpenses = (
  shopId: string,
  q: { dateFrom?: string; dateTo?: string; categoryId?: string } = {},
) =>
  apiGet<{ expenses: Expense[]; total: number }>(ENDPOINTS.EXPENSES.LIST, {
    shopId,
    limit: 100,
    ...q,
  });

export const createExpense = (input: CreateExpenseInput) =>
  apiPost<Expense>(ENDPOINTS.EXPENSES.CREATE, input);

export const voidExpense = (id: string, voidReason: string) =>
  apiPost<Expense>(ENDPOINTS.EXPENSES.VOID(id), { voidReason });

// ── Profit (P&L preview, nothing persisted) ──────────────────────────────

export const getProfitPreview = (
  shopId: string,
  periodStart: string,
  periodEnd: string,
) =>
  apiGet<ProfitPreview>(ENDPOINTS.PROFIT_REPORTS.PREVIEW, {
    shopId,
    periodStart,
    periodEnd,
  });
