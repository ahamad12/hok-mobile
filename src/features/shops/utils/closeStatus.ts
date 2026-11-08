import { addDays, isoToBusinessDate } from '@/utils/businessDate';

export type DayMark = 'closed' | 'draft' | 'none';

export type CloseStatus = {
  /** One line for the shop card. */
  line: string;
  /** Yesterday (or earlier in the week) was left without a finalized close. */
  behind: boolean;
  /** Oldest first, ending today: 7 marks. */
  week: DayMark[];
};

type SummaryLike = { date: string; status: string; voidedAt?: string | null };

/**
 * A shop's close record from its recent daily summaries, derived on the
 * client (no server feed yet). Voided summaries don't count.
 */
export function closeStatus(
  summaries: SummaryLike[],
  today: string,
): CloseStatus {
  const byDay = new Map<string, DayMark>();
  for (const s of summaries) {
    if (s.voidedAt) continue;
    byDay.set(
      isoToBusinessDate(s.date),
      s.status === 'FINALIZED' ? 'closed' : 'draft',
    );
  }
  const week = Array.from(
    { length: 7 },
    (_, i) => byDay.get(addDays(today, i - 6)) ?? 'none',
  );
  const todayMark = week[6];
  const yesterdayMark = week[5];

  const line =
    todayMark === 'closed'
      ? 'Closed today'
      : todayMark === 'draft'
        ? 'Draft saved today, awaiting finalize'
        : yesterdayMark !== 'closed'
          ? 'Open · yesterday not closed'
          : 'Open today';

  return { line, behind: yesterdayMark !== 'closed', week };
}
