import { buildNeedsYou, buildTeamToday, capped, setupSteps } from '../today';

const base = {
  yesterday: '2026-11-08',
  prevLoaded: true,
  prevSummary: { id: 'p', status: 'FINALIZED' },
  shortSuppliers: [],
  unassignedIssues: 0,
  ticketsTotal: 0,
  owedCents: null,
  licences: [],
  formatMoney: (c: number) => (c / 100).toFixed(2),
};

describe('buildNeedsYou', () => {
  it('says nothing on a clear day', () => {
    expect(buildNeedsYou(base)).toEqual([]);
  });

  it('ranks the five kinds and keeps the first four', () => {
    const rows = buildNeedsYou({
      ...base,
      prevSummary: null,
      shortSuppliers: ['Fresh Foods'],
      unassignedIssues: 2,
      owedCents: 482000,
      licences: [
        { productName: 'Tobacco', daysRemaining: 9, isExpired: false },
      ],
    });
    expect(rows.map((r) => r.key)).toEqual([
      'yesterday',
      'short',
      'unassigned',
      'payables',
    ]);
    expect(rows[1].title).toBe('Delivery short · Fresh Foods');
    expect(rows[3].title).toBe('Payables due · 4820.00');
  });

  it('points a waiting draft at its review', () => {
    const [row] = buildNeedsYou({
      ...base,
      prevSummary: { id: 'd', status: 'DRAFT' },
    });
    expect(row.title).toBe("Yesterday's draft waiting");
    expect(row.link.params).toEqual({ summaryId: 'd' });
  });
});

describe('buildTeamToday', () => {
  const day = '2026-11-09';
  const tasks = [
    {
      status: 'DONE',
      dueDate: null,
      completedAt: `${day}T10:00:00Z`,
      assigneeId: 'a',
    },
    {
      status: 'NOT_STARTED',
      dueDate: '2026-11-07T00:00:00Z',
      completedAt: null,
      assigneeId: 'a',
    },
    {
      status: 'IN_PROGRESS',
      dueDate: null,
      completedAt: null,
      assigneeId: 'b',
    },
    {
      status: 'NOT_STARTED',
      dueDate: null,
      completedAt: null,
      assigneeId: 'b',
    },
  ];
  const staff = [
    { id: 'b', displayName: 'Kamal' },
    { id: 'a', displayName: 'Nuwan' },
  ];

  it('counts done today, open and overdue', () => {
    const t = buildTeamToday(tasks, staff, day);
    expect([t.done, t.open, t.overdue]).toEqual([1, 3, 1]);
  });

  it('lists people with overdue work first', () => {
    const t = buildTeamToday(tasks, staff, day);
    expect(t.people.map((p) => p.name)).toEqual(['Nuwan', 'Kamal']);
    expect(t.people[0]).toMatchObject({ open: 1, overdue: 1 });
  });
});

describe('capped', () => {
  it('never shows a count from a truncated list', () => {
    expect(capped(4)).toBe('4');
    expect(capped(100, 140)).toBe('99+');
  });
});

describe('setupSteps', () => {
  it('lists only what is missing and disappears when complete', () => {
    expect(
      setupSteps({ games: 0, suppliers: 1, categories: 1, staff: 0 }).map(
        (s) => s.key,
      ),
    ).toEqual(['games', 'staff']);
    expect(
      setupSteps({ games: 1, suppliers: 1, categories: 1, staff: 1 }),
    ).toEqual([]);
  });
});
