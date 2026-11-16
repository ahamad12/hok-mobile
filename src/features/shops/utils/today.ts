import { IconName } from '@/components/AppIcon';
import { IconTileTone } from '@/components/ListItem';
import { isoToBusinessDate } from '@/utils/businessDate';

import { ShopLink } from './shopDay';

export type TodayRow = {
  key: string;
  icon: IconName;
  tone: IconTileTone;
  title: string;
  subtitle?: string;
  link: ShopLink;
};

/** Counts from a list capped at 100 rows: never show a wrong number. */
export const capped = (n: number, total?: number) =>
  (total ?? n) > 99 ? '99+' : String(n);

export type NeedsYouInput = {
  yesterday: string;
  prevLoaded: boolean;
  prevSummary: { id: string; status: string } | null | undefined;
  /** Supplier names of today's deliveries with short line items. */
  shortSuppliers: string[];
  unassignedIssues: number;
  ticketsTotal: number;
  /** null when the viewer may not see payables. */
  owedCents: number | null;
  licences: {
    productName: string;
    daysRemaining: number | null;
    isExpired: boolean;
  }[];
  formatMoney: (cents: number) => string;
};

/**
 * Needs you, ranked: yesterday's close, a short delivery today, unassigned
 * issues, payables due, licences. One row per kind (aggregated), first four
 * only. Overdue tasks live in Team today; acknowledgements in Work.
 */
export function buildNeedsYou(i: NeedsYouInput): TodayRow[] {
  const rows: TodayRow[] = [];

  if (i.prevLoaded && i.prevSummary?.status !== 'FINALIZED') {
    rows.push({
      key: 'yesterday',
      icon: 'CalendarX2',
      tone: 'error',
      title: i.prevSummary
        ? "Yesterday's draft waiting"
        : 'Yesterday not closed',
      subtitle: i.prevSummary ? 'Review and finalize it' : 'Count and close it',
      link: i.prevSummary
        ? { path: 'day/[summaryId]', params: { summaryId: i.prevSummary.id } }
        : { path: 'close-day', params: { date: i.yesterday } },
    });
  }

  if (i.shortSuppliers.length) {
    rows.push({
      key: 'short',
      icon: 'PackageX',
      tone: 'warning',
      title:
        i.shortSuppliers.length === 1
          ? `Delivery short · ${i.shortSuppliers[0]}`
          : `${i.shortSuppliers.length} deliveries short`,
      subtitle: 'Received less than ordered today',
      link: { path: 'records/deliveries' },
    });
  }

  if (i.unassignedIssues) {
    rows.push({
      key: 'unassigned',
      icon: 'MessageSquareWarning',
      tone: 'warning',
      title: `${capped(i.unassignedIssues, i.ticketsTotal)} ${i.unassignedIssues === 1 ? 'issue' : 'issues'} unassigned`,
      subtitle: 'Give each one to someone on shift',
      link: { path: 'work', params: { view: 'tickets' } },
    });
  }

  if (i.owedCents) {
    rows.push({
      key: 'payables',
      icon: 'Factory',
      tone: 'info',
      title: `Payables due · ${i.formatMoney(i.owedCents)}`,
      subtitle: 'Owed to suppliers, all deliveries',
      link: { path: 'records/deliveries' },
    });
  }

  if (i.licences.length) {
    const first = i.licences[0];
    rows.push({
      key: 'licences',
      icon: 'BadgeCheck',
      tone: i.licences.some((l) => l.isExpired) ? 'error' : 'warning',
      title:
        i.licences.length === 1
          ? first.isExpired
            ? `${first.productName} licence expired`
            : `Licence expiring${first.daysRemaining === null ? '' : ` · ${first.daysRemaining} days`}`
          : `${i.licences.length} licences need renewing`,
      subtitle: i.licences.length === 1 ? first.productName : undefined,
      link: { path: 'licenses' },
    });
  }

  return rows.slice(0, 4);
}

type TaskLike = {
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  assigneeId: string | null;
};

export type PersonLoad = {
  id: string;
  name: string;
  open: number;
  overdue: number;
};

export type TeamToday = {
  done: number;
  open: number;
  overdue: number;
  people: PersonLoad[];
};

const overdueOn = (t: TaskLike, day: string) =>
  t.status !== 'DONE' && !!t.dueDate && isoToBusinessDate(t.dueDate) < day;

/**
 * Team today from the shop's task list: done today (completedAt), open and
 * overdue, then each staff member's load, overdue first, four at most.
 */
export function buildTeamToday(
  tasks: TaskLike[],
  staff: { id: string; displayName: string }[],
  day: string,
): TeamToday {
  const open = tasks.filter((t) => t.status !== 'DONE');
  const people = staff
    .map((p) => {
      const mine = open.filter((t) => t.assigneeId === p.id);
      return {
        id: p.id,
        name: p.displayName,
        open: mine.length,
        overdue: mine.filter((t) => overdueOn(t, day)).length,
      };
    })
    .sort((a, b) => b.overdue - a.overdue || b.open - a.open)
    .slice(0, 4);

  return {
    done: tasks.filter(
      (t) => t.completedAt && isoToBusinessDate(t.completedAt) === day,
    ).length,
    open: open.length,
    overdue: open.filter((t) => overdueOn(t, day)).length,
    people,
  };
}

export type SetupStep = {
  key: string;
  title: string;
  subtitle: string;
  path: string;
};

/**
 * Owner-only "Set up this hok": shown while any basic is missing, gone once
 * all are in place. No dismiss.
 */
export function setupSteps(have: {
  games: number;
  suppliers: number;
  categories: number;
  staff: number;
}): SetupStep[] {
  const steps: SetupStep[] = [];
  if (!have.games) {
    steps.push({
      key: 'games',
      title: 'Add a scratch game',
      subtitle: 'So packs can be received and scanned',
      path: 'scratch/games',
    });
  }
  if (!have.categories) {
    steps.push({
      key: 'categories',
      title: 'Add a supplier category',
      subtitle: 'Group suppliers by what they sell',
      path: 'categories',
    });
  }
  if (!have.suppliers) {
    steps.push({
      key: 'suppliers',
      title: 'Add a supplier',
      subtitle: 'Who delivers stock to this hok',
      path: 'suppliers',
    });
  }
  if (!have.staff) {
    steps.push({
      key: 'staff',
      title: 'Invite your first staff member',
      subtitle: 'They run the shift and the scans',
      path: 'staff',
    });
  }
  return steps;
}
