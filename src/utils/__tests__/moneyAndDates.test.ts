import {
  addDays,
  formatBusinessDay,
  isBusinessDate,
  monthRange,
  toBusinessDate,
} from '../businessDate';
import { centsToInput, parseMoneyToCents } from '../money';

describe('parseMoneyToCents', () => {
  it('parses amounts with up to two decimals', () => {
    expect(parseMoneyToCents('12')).toBe(1200);
    expect(parseMoneyToCents('12.5')).toBe(1250);
    expect(parseMoneyToCents('1,234.56')).toBe(123456);
    expect(parseMoneyToCents('0.07')).toBe(7);
  });

  it('rejects negatives, junk and extra precision', () => {
    expect(parseMoneyToCents('-1')).toBeNull();
    expect(parseMoneyToCents('abc')).toBeNull();
    expect(parseMoneyToCents('1.234')).toBeNull();
    expect(parseMoneyToCents('')).toBeNull();
  });

  it('round-trips through centsToInput', () => {
    expect(parseMoneyToCents(centsToInput(98765))).toBe(98765);
  });
});

describe('business dates', () => {
  it('uses the local calendar day', () => {
    expect(toBusinessDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('adds days across month ends', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('labels today and yesterday', () => {
    const now = new Date(2026, 10, 7, 10);
    expect(formatBusinessDay('2026-11-07', now)).toBe('Today');
    expect(formatBusinessDay('2026-11-06', now)).toBe('Yesterday');
  });

  it('gives the month range', () => {
    expect(monthRange('2026-02-14')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    });
  });

  it('validates YYYY-MM-DD', () => {
    expect(isBusinessDate('2026-11-07')).toBe(true);
    expect(isBusinessDate('2026-02-30')).toBe(false);
    expect(isBusinessDate('7/11/2026')).toBe(false);
  });
});
