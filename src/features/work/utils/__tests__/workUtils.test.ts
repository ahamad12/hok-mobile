import { Task, Ticket } from '../../api/work.types';
import {
  isTaskOverdue,
  nextTaskStates,
  nextTicketStates,
  sortTasks,
  sortTickets,
} from '../workUtils';

const task = (over: Partial<Task> = {}): Task => ({
  id: 't1',
  shopId: 's1',
  title: 'Count float',
  description: null,
  assigneeId: null,
  status: 'NOT_STARTED',
  dueDate: null,
  isRecurring: false,
  recurringConfig: null,
  priority: 0,
  createdById: 'u1',
  completedAt: null,
  voidedAt: null,
  voidedById: null,
  voidReason: null,
  createdAt: '2026-11-01T08:00:00.000Z',
  updatedAt: '2026-11-01T08:00:00.000Z',
  ...over,
});

const ticket = (over: Partial<Ticket> = {}): Ticket => ({
  id: 'k1',
  shopId: 's1',
  type: 'ISSUE',
  subject: 'Fridge',
  status: 'OPEN',
  priority: 'NORMAL',
  requiresAck: false,
  createdById: 'u1',
  assigneeId: null,
  resolvedAt: null,
  createdAt: '2026-11-01T08:00:00.000Z',
  updatedAt: '2026-11-01T08:00:00.000Z',
  ...over,
});

describe('transitions mirror the server', () => {
  it('DONE tasks are terminal', () => {
    expect(nextTaskStates('DONE')).toEqual([]);
    expect(nextTaskStates('BLOCKED')).not.toContain('DONE');
  });

  it('broadcast tickets only open and close', () => {
    expect(nextTicketStates('ANNOUNCEMENT', 'OPEN')).toEqual(['CLOSED']);
    expect(nextTicketStates('INSTRUCTION', 'CLOSED')).toEqual(['OPEN']);
    expect(nextTicketStates('ISSUE', 'IN_PROGRESS')).toEqual([
      'RESOLVED',
      'OPEN',
    ]);
  });
});

describe('isTaskOverdue', () => {
  const now = new Date(2026, 10, 7, 12);

  it('is overdue only for open tasks due before today', () => {
    expect(
      isTaskOverdue(task({ dueDate: '2026-11-06T00:00:00.000Z' }), now),
    ).toBe(true);
    expect(
      isTaskOverdue(task({ dueDate: '2026-11-07T00:00:00.000Z' }), now),
    ).toBe(false);
    expect(
      isTaskOverdue(task({ dueDate: '2026-11-06', status: 'DONE' }), now),
    ).toBe(false);
    expect(isTaskOverdue(task({ dueDate: null }), now)).toBe(false);
  });
});

describe('sorting', () => {
  it('puts open tasks first, earliest due first, undated last', () => {
    const sorted = sortTasks([
      task({ id: 'done', status: 'DONE', dueDate: '2026-11-01' }),
      task({ id: 'undated' }),
      task({ id: 'later', dueDate: '2026-11-09' }),
      task({ id: 'soon', dueDate: '2026-11-08' }),
    ]);
    expect(sorted.map((t) => t.id)).toEqual([
      'soon',
      'later',
      'undated',
      'done',
    ]);
  });

  it('puts unresolved tickets first, by priority', () => {
    const sorted = sortTickets([
      ticket({ id: 'closed', status: 'CLOSED', priority: 'URGENT' }),
      ticket({ id: 'low', priority: 'LOW' }),
      ticket({ id: 'urgent', priority: 'URGENT' }),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(['urgent', 'low', 'closed']);
  });
});
