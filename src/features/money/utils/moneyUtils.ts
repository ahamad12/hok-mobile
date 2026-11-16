import { IconName } from '@/components/AppIcon';
import { BadgeTone } from '@/components/Badge';

import { DailySummary, TillCategory } from '../api/money.types';

export const TILL_CATEGORY: Record<
  TillCategory,
  { label: string; icon: IconName; direction: 'in' | 'out'; hint: string }
> = {
  SALES: {
    label: 'Sale',
    icon: 'ShoppingBag',
    direction: 'in',
    hint: 'Cash taken at the counter',
  },
  DEPOSIT: {
    label: 'Cash added',
    icon: 'ArrowDownToLine',
    direction: 'in',
    hint: 'Float or cash put into the till',
  },
  EXPENSE: {
    label: 'Paid out',
    icon: 'Receipt',
    direction: 'out',
    hint: 'Cash paid from the till',
  },
  WITHDRAWAL: {
    label: 'Cash removed',
    icon: 'ArrowUpFromLine',
    direction: 'out',
    hint: 'Banked or taken out of the till',
  },
};

/** Signed amount as it moves the till: + in, - out. Reversal rows already carry a negative amount. */
export function tillMovement(category: TillCategory, amount: number): number {
  return TILL_CATEGORY[category].direction === 'in' ? amount : -amount;
}

export type DayStatus = 'not_started' | 'draft' | 'closed';

/** null summary (404) = nobody has started closing that day. */
export function dayStatus(summary: DailySummary | null | undefined): DayStatus {
  if (!summary) return 'not_started';
  return summary.status === 'FINALIZED' ? 'closed' : 'draft';
}

export const DAY_STATUS: Record<DayStatus, { label: string; tone: BadgeTone }> =
  {
    not_started: { label: 'Not closed', tone: 'warning' },
    draft: { label: 'Draft', tone: 'info' },
    closed: { label: 'Closed', tone: 'success' },
  };

/** Counted minus expected. Positive = over, negative = short. */
export function varianceTone(
  variance: number | null | undefined,
): 'default' | 'success' | 'error' {
  if (!variance) return 'default';
  return variance > 0 ? 'success' : 'error';
}
