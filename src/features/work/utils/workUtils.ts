import { IconName } from '@/components/AppIcon';
import { BadgeTone } from '@/components/Badge';
import { toBusinessDate } from '@/utils/businessDate';

import {
  Task,
  TaskStatus,
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from '../api/work.types';

// Copies of tapt-api common/domain/{task,ticket}-transitions.ts so the app
// only offers moves the server accepts. The server stays authoritative.

const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  NOT_STARTED: ['IN_PROGRESS', 'BLOCKED', 'DONE'],
  IN_PROGRESS: ['DONE', 'BLOCKED', 'NOT_STARTED'],
  BLOCKED: ['NOT_STARTED', 'IN_PROGRESS'],
  DONE: [],
};

const ISSUE_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN'],
};

const BROADCAST_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['CLOSED'],
  IN_PROGRESS: [],
  RESOLVED: [],
  CLOSED: ['OPEN'],
};

export const nextTaskStates = (from: TaskStatus) => TASK_TRANSITIONS[from];

export const nextTicketStates = (type: TicketType, from: TicketStatus) =>
  (type === 'ISSUE' ? ISSUE_TRANSITIONS : BROADCAST_TRANSITIONS)[from];

export const TASK_STATUS: Record<
  TaskStatus,
  { label: string; tone: BadgeTone; action: string; icon: IconName }
> = {
  NOT_STARTED: {
    label: 'To do',
    tone: 'neutral',
    action: 'Move to to-do',
    icon: 'Circle',
  },
  IN_PROGRESS: {
    label: 'In progress',
    tone: 'info',
    action: 'Start',
    icon: 'CircleDot',
  },
  BLOCKED: {
    label: 'Blocked',
    tone: 'warning',
    action: 'Mark blocked',
    icon: 'CircleSlash',
  },
  DONE: {
    label: 'Done',
    tone: 'success',
    action: 'Mark done',
    icon: 'CircleCheck',
  },
};

export const TICKET_STATUS: Record<
  TicketStatus,
  { label: string; tone: BadgeTone; action: string }
> = {
  OPEN: { label: 'Open', tone: 'warning', action: 'Reopen' },
  IN_PROGRESS: { label: 'In progress', tone: 'info', action: 'Start working' },
  RESOLVED: { label: 'Resolved', tone: 'success', action: 'Mark resolved' },
  CLOSED: { label: 'Closed', tone: 'neutral', action: 'Close' },
};

export const TICKET_TYPE: Record<
  TicketType,
  { label: string; icon: IconName; hint: string }
> = {
  ISSUE: {
    label: 'Issue',
    icon: 'TriangleAlert',
    hint: 'Something is broken or wrong',
  },
  INSTRUCTION: {
    label: 'Instruction',
    icon: 'ClipboardList',
    hint: 'Tell the team what to do',
  },
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: 'Megaphone',
    hint: 'Share news with the shop',
  },
};

export const TICKET_PRIORITY: Record<
  TicketPriority,
  { label: string; tone: BadgeTone; rank: number }
> = {
  URGENT: { label: 'Urgent', tone: 'error', rank: 0 },
  HIGH: { label: 'High', tone: 'warning', rank: 1 },
  NORMAL: { label: 'Normal', tone: 'neutral', rank: 2 },
  LOW: { label: 'Low', tone: 'neutral', rank: 3 },
};

/** Open work whose due date (a calendar day) is before today. */
export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'DONE' || task.voidedAt) return false;
  return task.dueDate.slice(0, 10) < toBusinessDate(now);
}

/** Open first, then by due date (undated last), then newest. */
export function sortTasks(tasks: Task[]): Task[] {
  const open = (t: Task) => (t.status === 'DONE' ? 1 : 0);
  return [...tasks].sort(
    (a, b) =>
      open(a) - open(b) ||
      (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

/** Unresolved first, by priority, then newest. */
export function sortTickets(tickets: Ticket[]): Ticket[] {
  const done = (t: Ticket) =>
    t.status === 'RESOLVED' || t.status === 'CLOSED' ? 1 : 0;
  return [...tickets].sort(
    (a, b) =>
      done(a) - done(b) ||
      TICKET_PRIORITY[a.priority].rank - TICKET_PRIORITY[b.priority].rank ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
