import { IconName } from '@/components/AppIcon';
import { IconTileTone } from '@/components/ListItem';

/** Where a row leads: a route under /shop/[shopId] plus its params. */
export type ShopLink = { path: string; params?: Record<string, string> };

export type AttentionItem = {
  key: string;
  icon: IconName;
  tone: IconTileTone;
  title: string;
  subtitle: string;
  link: ShopLink;
  /** Lower sorts first. */
  rank: number;
};

type SummaryLike = { id: string; status: string } | null | undefined;

export type AttentionInput = {
  yesterday: string;
  prevSummary: SummaryLike;
  prevLoaded: boolean;
  canFinalize: boolean;
  canDraft: boolean;
  overdueTasks: number;
  openTickets: number;
  urgentTickets: number;
  licences: {
    id: string;
    productName: string;
    licenseNumber: string;
    isExpired: boolean;
    daysRemaining: number | null;
  }[];
};

/**
 * "Needs you" for one shop: exceptions only, most severe first. Activity
 * will group the same items across shops.
 */
export function buildAttention(i: AttentionInput): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (i.prevLoaded && i.prevSummary?.status !== 'FINALIZED') {
    const draft = !!i.prevSummary;
    items.push({
      key: 'prev',
      icon: 'CalendarX2',
      tone: 'error',
      rank: 0,
      title: draft ? 'Yesterday is still a draft' : 'Yesterday not closed',
      subtitle: draft
        ? i.canFinalize
          ? 'Review and finalize it'
          : 'Waiting for an owner or manager'
        : 'Close it so the till carries over',
      link: i.prevSummary
        ? { path: 'day/[summaryId]', params: { summaryId: i.prevSummary.id } }
        : i.canDraft
          ? { path: 'close-day', params: { date: i.yesterday } }
          : { path: 'records' },
    });
  }

  if (i.openTickets > 0) {
    items.push({
      key: 'tickets',
      icon: 'MessageSquareWarning',
      tone: i.urgentTickets ? 'error' : 'warning',
      rank: i.urgentTickets ? 1 : 3,
      title: `${i.openTickets} open ${i.openTickets === 1 ? 'ticket' : 'tickets'}`,
      subtitle: i.urgentTickets
        ? `${i.urgentTickets} high priority`
        : 'Issues, instructions and announcements',
      link: { path: 'work', params: { view: 'tickets' } },
    });
  }

  if (i.overdueTasks > 0) {
    items.push({
      key: 'overdue',
      icon: 'ListTodo',
      tone: 'warning',
      rank: 2,
      title: `${i.overdueTasks} ${i.overdueTasks === 1 ? 'task' : 'tasks'} overdue`,
      subtitle: 'Past their due date',
      link: { path: 'work', params: { view: 'tasks', filter: 'overdue' } },
    });
  }

  for (const l of i.licences) {
    items.push({
      key: `licence-${l.id}`,
      icon: 'BadgeCheck',
      tone: l.isExpired ? 'error' : 'warning',
      rank: l.isExpired ? 1 : 4,
      title: l.isExpired
        ? `${l.productName} licence expired`
        : l.daysRemaining === null
          ? `${l.productName} licence expiring soon`
          : `${l.productName} licence · ${l.daysRemaining} days left`,
      subtitle: l.licenseNumber,
      link: { path: 'licenses/[licenseId]', params: { licenseId: l.id } },
    });
  }

  return items.sort((a, b) => a.rank - b.rank);
}

export type ShiftStep = {
  key: 'morning' | 'deliveries' | 'tasks' | 'evening' | 'close';
  title: string;
  subtitle: string;
  /** null: no completion signal exists (shown, never blocks "Next"). */
  done: boolean | null;
  link: ShopLink;
};

export type ShiftInput = {
  today: string;
  morningScans: number;
  eveningScans: number;
  overdueTasks: number;
  canDraft: boolean;
  summary: SummaryLike;
};

/**
 * The shift as an ordered checklist. There are no shift times, so steps
 * are ordered, not timed; "Next" is the first incomplete step.
 */
export function buildShiftSteps(i: ShiftInput): ShiftStep[] {
  const steps: ShiftStep[] = [
    {
      key: 'morning',
      title: 'Morning scratch scan',
      subtitle:
        i.morningScans > 0
          ? `${i.morningScans} ${i.morningScans === 1 ? 'pack' : 'packs'} scanned`
          : 'Scan every pack on display',
      done: i.morningScans > 0,
      link: { path: 'scratch', params: { shift: 'MORNING' } },
    },
    {
      key: 'deliveries',
      title: 'Deliveries',
      subtitle: 'Record stock as it arrives',
      done: null,
      link: { path: 'deliveries' },
    },
    {
      key: 'tasks',
      title: 'Tasks due',
      subtitle:
        i.overdueTasks > 0 ? `${i.overdueTasks} overdue` : 'Nothing overdue',
      done: i.overdueTasks === 0,
      link: { path: 'work', params: { view: 'tasks', filter: 'overdue' } },
    },
    {
      key: 'evening',
      title: 'Evening scratch scan',
      subtitle:
        i.eveningScans > 0
          ? `${i.eveningScans} ${i.eveningScans === 1 ? 'pack' : 'packs'} scanned`
          : 'Scan again before you close',
      done: i.eveningScans > 0,
      link: { path: 'scratch', params: { shift: 'EVENING' } },
    },
  ];
  if (i.canDraft) {
    steps.push({
      key: 'close',
      title: 'Count the till and save the day',
      subtitle: i.summary ? 'Saved' : 'Count cash, then save a draft',
      done: !!i.summary,
      link: i.summary
        ? { path: 'day/[summaryId]', params: { summaryId: i.summary.id } }
        : { path: 'close-day', params: { date: i.today } },
    });
  }
  return steps;
}

/** Index of the first step that can still be done, or -1. */
export const nextStepIndex = (steps: ShiftStep[]) =>
  steps.findIndex((s) => s.done === false);
