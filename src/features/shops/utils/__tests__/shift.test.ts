import { buildForYou, buildShiftHero } from '../shift';

const day = '2026-11-09';
const hero = (o: Partial<Parameters<typeof buildShiftHero>[0]>) =>
  buildShiftHero({
    today: day,
    morningScans: 0,
    eveningScans: 0,
    canClose: true,
    summary: null,
    ...o,
  });

describe('buildShiftHero', () => {
  it('walks morning, evening, then close for supervisors', () => {
    expect(hero({}).action).toBe('Start morning scan');
    expect(hero({ morningScans: 3 }).action).toBe('Start evening scan');
    expect(hero({ morningScans: 3, eveningScans: 3 }).action).toBe(
      'Count & close',
    );
  });

  it('ends at "all done" for plain staff (no close, no money)', () => {
    const h = hero({ morningScans: 2, eveningScans: 2, canClose: false });
    expect(h).toMatchObject({ title: 'All done for today ✓', done: true });
    expect(h.link).toBeNull();
  });

  it('waits honestly once the draft is in', () => {
    const h = hero({
      morningScans: 1,
      eveningScans: 1,
      summary: { id: 's', status: 'DRAFT' },
    });
    expect(h.title).toBe('Submitted · waiting for manager');
    expect(h.action).toBeNull();
  });
});

describe('buildForYou', () => {
  const tasks = [
    {
      id: '1',
      title: 'Restock',
      status: 'NOT_STARTED',
      dueDate: `${day}T00:00:00Z`,
      assigneeId: 'me',
      createdById: 'boss',
    },
    {
      id: '2',
      title: 'Fix shelf',
      status: 'IN_PROGRESS',
      dueDate: '2026-11-05T00:00:00Z',
      assigneeId: null,
      createdById: 'me',
    },
    {
      id: '3',
      title: 'Not mine',
      status: 'NOT_STARTED',
      dueDate: '2026-11-01T00:00:00Z',
      assigneeId: 'x',
      createdById: 'x',
    },
    {
      id: '4',
      title: 'Done',
      status: 'DONE',
      dueDate: '2026-11-01T00:00:00Z',
      assigneeId: 'me',
      createdById: 'me',
    },
  ];
  const tickets = [
    { id: 't', subject: 'Fridge leaking', status: 'OPEN', assigneeId: 'me' },
  ];

  it('puts my overdue first, then due today, then my tickets', () => {
    expect(buildForYou(tasks, tickets, 'me', day).map((r) => r.key)).toEqual([
      'task-2',
      'task-1',
      'ticket-t',
    ]);
  });

  it('shows at most three', () => {
    const many = Array.from({ length: 5 }, (_, i) => ({
      ...tasks[0],
      id: `m${i}`,
    }));
    expect(buildForYou(many, [], 'me', day)).toHaveLength(3);
  });
});
