const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** "just now", "5 min ago", "3 h ago", "2 days ago", else a short date. */
export function formatRelativeTime(
  iso: string | Date,
  now: Date = new Date(),
): string {
  const t = typeof iso === 'string' ? new Date(iso) : iso;
  const diff = now.getTime() - t.getTime();
  if (Number.isNaN(diff)) return '';
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MIN)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`;
  const days = Math.floor(diff / DAY);
  if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`;
  return formatShortDate(t);
}

/** Whole days until `iso` (negative once passed). */
export function daysUntil(iso: string | Date, now: Date = new Date()): number {
  const t = typeof iso === 'string' ? new Date(iso) : iso;
  return Math.ceil((t.getTime() - now.getTime()) / DAY);
}

/** "Expires in 3 days" / "Expires today" / "Expired". */
export function formatExpiry(iso: string, now: Date = new Date()): string {
  const d = daysUntil(iso, now);
  if (new Date(iso).getTime() <= now.getTime()) return 'Expired';
  if (d <= 1) return 'Expires today';
  return `Expires in ${d} days`;
}

export function formatShortDate(d: string | Date): string {
  const t = typeof d === 'string' ? new Date(d) : d;
  return t.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
