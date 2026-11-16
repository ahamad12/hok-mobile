import {
  ScratchGame,
  ScratchPack,
  ScratchScan,
  ShiftPeriod,
} from '../api/scratch.types';

export const SHIFT_LABEL: Record<ShiftPeriod, string> = {
  MORNING: 'Morning',
  EVENING: 'Evening',
};

/** Live (non-voided) scans per shift, and which packs they cover. */
export function shiftProgress(scans: ScratchScan[]) {
  const live = scans.filter((s) => !s.voidedAt);
  const of = (shift: ShiftPeriod) =>
    live.filter((s) => s.shiftPeriod === shift);
  const morning = of('MORNING');
  const evening = of('EVENING');
  return {
    morning: {
      count: morning.length,
      packIds: new Set(morning.map((s) => s.packId)),
    },
    evening: {
      count: evening.length,
      packIds: new Set(evening.map((s) => s.packId)),
    },
    revenueCents: live.reduce((n, s) => n + s.revenueCents, 0),
    ticketsSold: live.reduce((n, s) => n + s.ticketsSoldSincePrevious, 0),
  };
}

/**
 * The shift a new scan most likely belongs to. The API does not enforce
 * shift times (only one scan per pack per shift), so this is a default
 * the user can change.
 */
export function suggestedShift(
  scans: ScratchScan[],
  packId: string | undefined,
  now: Date = new Date(),
): ShiftPeriod {
  const p = shiftProgress(scans);
  if (packId && p.morning.packIds.has(packId)) return 'EVENING';
  return now.getHours() < 14 ? 'MORNING' : 'EVENING';
}

/** "Lucky 7s · #1234" or the game name alone. */
export function gameTitle(game?: ScratchGame): string {
  if (!game) return 'Scratch game';
  return game.gameNumber ? `${game.name} · #${game.gameNumber}` : game.name;
}

/** Next serial to sell from, assuming tickets sell upward from serialStart. */
export function formatSerial(n: number): string {
  return String(Math.max(0, n)).padStart(3, '0');
}

/** "Pack 000 · 50 tickets" */
export function packSubtitle(pack: ScratchPack, game?: ScratchGame): string {
  const size = game ? ` · ${game.ticketsPerPack} tickets` : '';
  return `Pack from ${pack.serialStart}${size}`;
}

export const isValidSerial = (s: string) => /^\d{3}$/.test(s);
