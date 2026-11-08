import { buildAttention, buildShiftSteps, nextStepIndex } from '../shopDay';

const base = {
  yesterday: '2026-11-07',
  prevSummary: { id: 'p', status: 'FINALIZED' },
  prevLoaded: true,
  canFinalize: true,
  canDraft: true,
  overdueTasks: 0,
  openTickets: 0,
  urgentTickets: 0,
  licences: [],
};

describe('buildAttention', () => {
  it('is empty on a quiet day', () => {
    expect(buildAttention(base)).toEqual([]);
  });

  it('flags an unclosed yesterday first', () => {
    const items = buildAttention({
      ...base,
      prevSummary: null,
      overdueTasks: 2,
    });
    expect(items[0].key).toBe('prev');
    expect(items[0].link).toEqual({
      path: 'close-day',
      params: { date: '2026-11-07' },
    });
  });

  it('ranks urgent tickets above overdue tasks', () => {
    const items = buildAttention({
      ...base,
      overdueTasks: 3,
      openTickets: 2,
      urgentTickets: 1,
    });
    expect(items.map((i) => i.key)).toEqual(['tickets', 'overdue']);
  });

  it('waits for yesterday to load before flagging it', () => {
    expect(
      buildAttention({ ...base, prevSummary: null, prevLoaded: false }),
    ).toEqual([]);
  });
});

describe('buildShiftSteps', () => {
  const shift = {
    today: '2026-11-08',
    morningScans: 0,
    eveningScans: 0,
    overdueTasks: 0,
    canDraft: false,
    summary: null,
  };

  it('orders the shift and marks the first open step as next', () => {
    const steps = buildShiftSteps(shift);
    expect(steps.map((s) => s.key)).toEqual([
      'morning',
      'deliveries',
      'tasks',
      'evening',
    ]);
    expect(nextStepIndex(steps)).toBe(0);
  });

  it('never makes deliveries the next step (no completion signal)', () => {
    const steps = buildShiftSteps({ ...shift, morningScans: 4 });
    expect(steps[nextStepIndex(steps)].key).toBe('evening');
  });

  it('adds the till close only for supervisors', () => {
    const steps = buildShiftSteps({ ...shift, canDraft: true });
    expect(steps.at(-1)?.key).toBe('close');
  });

  it('has no next step once everything is done', () => {
    const steps = buildShiftSteps({
      ...shift,
      morningScans: 3,
      eveningScans: 3,
      canDraft: true,
      summary: { id: 's', status: 'DRAFT' },
    });
    expect(nextStepIndex(steps)).toBe(-1);
  });
});
