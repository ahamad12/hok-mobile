import { isoToBusinessDate } from '@/utils/businessDate';

import { ShopLink } from './shopDay';
import { TodayRow } from './today';

export type ShiftHero = {
  title: string;
  subtitle: string;
  /** null when there is nothing left to press (done, or waiting). */
  action: string | null;
  link: ShopLink | null;
  done: boolean;
};

/**
 * One action for the shift: the next incomplete step. Staff have two steps
 * (morning and evening scan); supervisors also close the day. No shift
 * times exist, so steps are ordered, never guessed from the clock.
 */
export function buildShiftHero(i: {
  today: string;
  morningScans: number;
  eveningScans: number;
  canClose: boolean;
  summary: { id: string; status: string } | null | undefined;
  submittedAt?: string;
}): ShiftHero {
  if (!i.morningScans) {
    return {
      title: 'Morning scratch scan',
      subtitle: 'Scan every pack on display',
      action: 'Start morning scan',
      link: { path: 'scratch', params: { shift: 'MORNING' } },
      done: false,
    };
  }
  if (!i.eveningScans) {
    return {
      title: 'Evening scratch scan',
      subtitle: `Morning done · ${i.morningScans} ${i.morningScans === 1 ? 'pack' : 'packs'}`,
      action: 'Start evening scan',
      link: { path: 'scratch', params: { shift: 'EVENING' } },
      done: false,
    };
  }
  if (!i.canClose) {
    return {
      title: 'All done for today ✓',
      subtitle: 'Both scratch scans are in',
      action: null,
      link: null,
      done: true,
    };
  }
  if (!i.summary) {
    return {
      title: 'Count the till and close',
      subtitle: 'Both scans are in. Count the cash, then submit the day.',
      action: 'Count & close',
      link: { path: 'close-day', params: { date: i.today } },
      done: false,
    };
  }
  const open = { path: 'day/[summaryId]', params: { summaryId: i.summary.id } };
  return i.summary.status === 'FINALIZED'
    ? {
        title: 'Day closed ✓',
        subtitle: 'Finalized by a manager',
        action: null,
        link: open,
        done: true,
      }
    : {
        title: 'Submitted · waiting for manager',
        subtitle: i.submittedAt
          ? `Draft saved ${i.submittedAt}`
          : 'A manager finalizes it',
        action: null,
        link: open,
        done: true,
      };
}

type TaskLike = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  assigneeId: string | null;
  createdById: string;
};
type TicketLike = {
  id: string;
  subject: string;
  status: string;
  assigneeId: string | null;
};

/**
 * For you, at most three: my tasks (assigned to or created by me) that are
 * overdue, then due today, then tickets assigned to me. Acknowledgements are
 * left out until the API can say whether I have acknowledged.
 */
export function buildForYou(
  tasks: TaskLike[],
  tickets: TicketLike[],
  me: string,
  day: string,
): TodayRow[] {
  const mine = tasks.filter(
    (t) => t.status !== 'DONE' && (t.assigneeId === me || t.createdById === me),
  );
  const due = (t: TaskLike) =>
    t.dueDate ? isoToBusinessDate(t.dueDate) : null;
  const overdue = mine.filter((t) => {
    const d = due(t);
    return d !== null && d < day;
  });
  const today = mine.filter((t) => due(t) === day);

  const rows: TodayRow[] = [
    ...overdue.map<TodayRow>((t) => ({
      key: `task-${t.id}`,
      icon: 'ListTodo',
      tone: 'error',
      title: t.title,
      subtitle: 'Overdue',
      link: { path: 'tasks/[taskId]', params: { taskId: t.id } },
    })),
    ...today.map<TodayRow>((t) => ({
      key: `task-${t.id}`,
      icon: 'ListTodo',
      tone: 'warning',
      title: t.title,
      subtitle: 'Due today',
      link: { path: 'tasks/[taskId]', params: { taskId: t.id } },
    })),
    ...tickets
      .filter(
        (t) =>
          t.assigneeId === me &&
          t.status !== 'CLOSED' &&
          t.status !== 'RESOLVED',
      )
      .map<TodayRow>((t) => ({
        key: `ticket-${t.id}`,
        icon: 'MessageSquare',
        tone: 'info',
        title: t.subject,
        subtitle: 'Ticket assigned to you',
        link: { path: 'tickets/[ticketId]', params: { ticketId: t.id } },
      })),
  ];
  return rows.slice(0, 3);
}
