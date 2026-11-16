import { ScratchScan } from '../../api/scratch.types';
import { isValidSerial, shiftProgress, suggestedShift } from '../scratchUtils';

const scan = (over: Partial<ScratchScan> = {}): ScratchScan => ({
  id: 'x',
  packId: 'p1',
  gameId: 'g1',
  shopId: 's1',
  scanDate: '2026-11-07T00:00:00.000Z',
  shiftPeriod: 'MORNING',
  scannedSerial: '010',
  ticketsSoldSincePrevious: 10,
  ticketsRemaining: 40,
  unitPriceCents: 500,
  revenueCents: 5000,
  scannedById: 'u1',
  voidedAt: null,
  voidedById: null,
  voidReason: null,
  createdAt: '2026-11-07T08:00:00.000Z',
  ...over,
});

describe('shiftProgress', () => {
  it('counts live scans per shift and ignores voided ones', () => {
    const p = shiftProgress([
      scan({ id: 'a', packId: 'p1' }),
      scan({ id: 'b', packId: 'p2', voidedAt: '2026-11-07T09:00:00.000Z' }),
      scan({
        id: 'c',
        packId: 'p1',
        shiftPeriod: 'EVENING',
        revenueCents: 1500,
        ticketsSoldSincePrevious: 3,
      }),
    ]);
    expect(p.morning.count).toBe(1);
    expect(p.evening.count).toBe(1);
    expect(p.morning.packIds.has('p2')).toBe(false);
    expect(p.revenueCents).toBe(6500);
    expect(p.ticketsSold).toBe(13);
  });
});

describe('suggestedShift', () => {
  it('suggests evening once the pack has a morning scan', () => {
    expect(suggestedShift([scan()], 'p1', new Date(2026, 10, 7, 9))).toBe(
      'EVENING',
    );
  });

  it('falls back to the time of day', () => {
    expect(suggestedShift([], 'p1', new Date(2026, 10, 7, 9))).toBe('MORNING');
    expect(suggestedShift([], 'p1', new Date(2026, 10, 7, 18))).toBe('EVENING');
  });
});

it('accepts only three-digit serials', () => {
  expect(isValidSerial('007')).toBe(true);
  expect(isValidSerial('7')).toBe(false);
  expect(isValidSerial('0071')).toBe(false);
});
