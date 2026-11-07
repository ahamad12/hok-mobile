// A business day is a calendar date in the shop's local time, sent to the
// API as "YYYY-MM-DD" (the contracts coerce it; scanDate and daily summary
// date are @db.Date columns).

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date of `d` as "YYYY-MM-DD". */
export function toBusinessDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return toBusinessDate(new Date(y, m - 1, d + delta));
}

export const today = () => toBusinessDate();
export const yesterday = () => addDays(today(), -1);

/** Parses "YYYY-MM-DD" (or an ISO timestamp) as a local calendar date. */
export function parseBusinessDate(day: string): Date {
  const [y, m, d] = day.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * ISO from a @db.Date column ("2026-11-07T00:00:00.000Z") -> the calendar
 * day it names, ignoring the device's offset from UTC.
 */
export function isoToBusinessDate(iso: string): string {
  return iso.slice(0, 10);
}

/** "Today", "Yesterday", else "Mon 3 Nov". */
export function formatBusinessDay(day: string, now: Date = new Date()): string {
  const t = toBusinessDate(now);
  if (day === t) return 'Today';
  if (day === addDays(t, -1)) return 'Yesterday';
  if (day === addDays(t, 1)) return 'Tomorrow';
  return parseBusinessDate(day).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** First and last day of the month containing `day`. */
export function monthRange(day: string = today()): {
  from: string;
  to: string;
} {
  const d = parseBusinessDate(day);
  return {
    from: toBusinessDate(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: toBusinessDate(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
}

/** True for "YYYY-MM-DD" strings that name a real date. */
export function isBusinessDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return toBusinessDate(parseBusinessDate(s)) === s;
}
