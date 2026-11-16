import { isoToBusinessDate } from '@/utils/businessDate';

/**
 * Mirrors tapt-api common/domain/daily-summary-reconciliation.ts. This is
 * the only "expected closing" the app may show for a day: the till summary's
 * expected leaves out scratch, delivery cost and recorded expenses.
 */
export type DayAggregates = {
  openingBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  scratchRevenue: number;
  deliveryExpense: number;
  otherIncome: number;
  otherExpense: number;
};

export function expectedClosing(a: DayAggregates): number {
  return (
    a.openingBalance +
    a.totalCashIn -
    a.totalCashOut +
    a.scratchRevenue -
    a.deliveryExpense +
    a.otherIncome -
    a.otherExpense
  );
}

export const cashMovement = (a: DayAggregates) =>
  a.totalCashIn - a.totalCashOut;

/** Counted minus expected; positive means over. */
export const varianceOf = (counted: number, a: DayAggregates) =>
  counted - expectedClosing(a);

/** Server's till buckets (create-daily-summary.use-case.ts). */
export const TILL_IN = ['SALES', 'DEPOSIT'] as const;
export const TILL_OUT = ['EXPENSE', 'WITHDRAWAL'] as const;

type Dated = { voidedAt: string | null };

/** Live (non-voided) rows whose date field falls on `day`. */
export function onDay<T extends Dated>(
  rows: T[],
  day: string,
  dateOf: (r: T) => string,
): T[] {
  return rows.filter(
    (r) => !r.voidedAt && isoToBusinessDate(dateOf(r)) === day,
  );
}

export type ComposeInput = {
  /** Closing balance of the latest non-voided summary before the day, or 0. */
  previousClosing: number | null;
  totalCashIn: number;
  totalCashOut: number;
  scratchRevenue: number;
  deliveries: { totalAmountCents: number }[];
  expenses: { amount: number }[];
};

/**
 * The aggregates the server will store when this day is submitted, built
 * from the same sources, so the live variance equals the stored one.
 */
export function composeAggregates(i: ComposeInput): DayAggregates {
  return {
    openingBalance: i.previousClosing ?? 0,
    totalCashIn: i.totalCashIn,
    totalCashOut: i.totalCashOut,
    scratchRevenue: i.scratchRevenue,
    deliveryExpense: i.deliveries.reduce((n, d) => n + d.totalAmountCents, 0),
    // No schema source for other income yet; the server stores 0.
    otherIncome: 0,
    otherExpense: i.expenses.reduce((n, e) => n + e.amount, 0),
  };
}
