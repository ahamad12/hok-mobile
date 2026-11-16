import {
  cashMovement,
  composeAggregates,
  expectedClosing,
  onDay,
  varianceOf,
} from '../reconcile';

const day = {
  openingBalance: 98000,
  totalCashIn: 160000, // sales 1,480 + deposits 120
  totalCashOut: 32000, // payouts 120 + withdrawals 200
  scratchRevenue: 38600,
  deliveryExpense: 62000,
  otherIncome: 0,
  otherExpense: 12000,
};

describe('reconcile', () => {
  it('matches the server formula', () => {
    // 980 + 1,600 − 320 + 386 − 620 + 0 − 120 = 1,906.00
    expect(expectedClosing(day)).toBe(190600);
    expect(cashMovement(day)).toBe(128000);
  });

  it('includes other income, as the server does', () => {
    expect(expectedClosing({ ...day, otherIncome: 500 })).toBe(191100);
  });

  it('gives the stored variance from the counted cash', () => {
    expect(varianceOf(190800, day)).toBe(200);
    expect(varianceOf(190000, day)).toBe(-600);
  });

  it('composes the same aggregates the server will store', () => {
    const a = composeAggregates({
      previousClosing: 98000,
      totalCashIn: 160000,
      totalCashOut: 32000,
      scratchRevenue: 38600,
      deliveries: [{ totalAmountCents: 50000 }, { totalAmountCents: 12000 }],
      expenses: [{ amount: 7000 }, { amount: 5000 }],
    });
    expect(a).toEqual(day);
    // Compose-mode variance equals what the summary will store.
    expect(varianceOf(190800, a)).toBe(varianceOf(190800, day));
  });

  it('opens at zero when there is no previous close', () => {
    expect(
      composeAggregates({
        previousClosing: null,
        totalCashIn: 0,
        totalCashOut: 0,
        scratchRevenue: 0,
        deliveries: [],
        expenses: [],
      }).openingBalance,
    ).toBe(0);
  });

  it('keeps only live rows from the given day', () => {
    const rows = [
      { id: 'a', voidedAt: null, at: '2026-11-08T09:00:00.000Z' },
      { id: 'b', voidedAt: 'x', at: '2026-11-08T10:00:00.000Z' },
      { id: 'c', voidedAt: null, at: '2026-11-07T10:00:00.000Z' },
    ];
    expect(onDay(rows, '2026-11-08', (r) => r.at).map((r) => r.id)).toEqual([
      'a',
    ]);
  });
});
