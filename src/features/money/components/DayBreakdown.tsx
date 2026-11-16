import React from 'react';

import { ListItem, ListSection } from '@/components/ListItem';
import { formatMoney, formatSignedMoney } from '@/utils/money';

import {
  cashMovement,
  DayAggregates,
  expectedClosing,
} from '../utils/reconcile';

type Props = {
  a: DayAggregates;
  /** Till totals by category (SALES, DEPOSIT, EXPENSE, WITHDRAWAL). */
  byCategory: Record<string, number>;
  openingLabel: string;
  morningScratch: number;
  eveningScratch: number;
  deliveryCount: number;
  shortItems: number;
  expenseCount: number;
  /** Counted cash; null while composing and nothing is entered yet. */
  actual: number | null;
  onOpen: (path: string) => void;
};

/**
 * The day, reconciled: cash, then scratch, then costs, down to expected
 * closing, which is exactly the server's formula. "Till payouts" (cash paid
 * out of the till) and "Recorded expenses" (rent, wages) are different
 * sources and are never both called "Expenses".
 */
export function DayBreakdown({
  a,
  byCategory,
  openingLabel,
  morningScratch,
  eveningScratch,
  deliveryCount,
  shortItems,
  expenseCount,
  actual,
  onOpen,
}: Props) {
  const expected = expectedClosing(a);
  const variance = actual === null ? null : actual - expected;
  const cat = (k: string) => byCategory[k] ?? 0;
  const tillRow = (title: string, sign: '+' | '−', key: string) => (
    <ListItem
      title={`${sign} ${title}`}
      value={formatMoney(cat(key))}
      onPress={() => onOpen('records/till')}
    />
  );

  return (
    <>
      <ListSection title='Cash'>
        <ListItem
          title={openingLabel}
          value={formatMoney(a.openingBalance)}
          chevron={false}
        />
        {tillRow('Sales', '+', 'SALES')}
        {tillRow('Deposits', '+', 'DEPOSIT')}
        {tillRow('Till payouts', '−', 'EXPENSE')}
        {tillRow('Withdrawals', '−', 'WITHDRAWAL')}
        <ListItem
          title='= Cash movement'
          value={formatSignedMoney(cashMovement(a))}
          chevron={false}
        />
      </ListSection>

      <ListSection title='Scratch'>
        <ListItem
          title='+ Scratch revenue'
          subtitle={`Morning ${formatMoney(morningScratch)} · Evening ${formatMoney(eveningScratch)}`}
          value={formatMoney(a.scratchRevenue)}
          onPress={() => onOpen('records/scratch')}
        />
      </ListSection>

      <ListSection title='Costs'>
        <ListItem
          title='− Delivery cost'
          subtitle={`${deliveryCount} ${deliveryCount === 1 ? 'delivery' : 'deliveries'}${shortItems ? ` · ${shortItems} ${shortItems === 1 ? 'item' : 'items'} short` : ''}`}
          value={formatMoney(a.deliveryExpense)}
          onPress={() => onOpen('records/deliveries')}
        />
        <ListItem
          title='− Recorded expenses'
          subtitle={`${expenseCount} ${expenseCount === 1 ? 'entry' : 'entries'}`}
          value={formatMoney(a.otherExpense)}
          onPress={() => onOpen('expenses')}
        />
        {a.otherIncome ? (
          <ListItem
            title='+ Other income'
            value={formatMoney(a.otherIncome)}
            chevron={false}
          />
        ) : null}
      </ListSection>

      <ListSection title='Reconciliation'>
        <ListItem
          title='Expected closing'
          value={formatMoney(expected)}
          chevron={false}
        />
        <ListItem
          title='Actual closing (counted)'
          value={actual === null ? '–' : formatMoney(actual)}
          chevron={false}
        />
        <ListItem
          title='Variance'
          subtitle={
            variance === null
              ? 'Enter the counted cash'
              : variance === 0
                ? 'Balanced'
                : variance > 0
                  ? 'Over'
                  : 'Short'
          }
          value={variance === null ? '–' : formatSignedMoney(variance)}
          chevron={false}
        />
      </ListSection>
    </>
  );
}
