import { closeStatus } from '../closeStatus';

const today = '2026-11-08';
const s = (
  date: string,
  status = 'FINALIZED',
  voidedAt: string | null = null,
) => ({
  date: `${date}T00:00:00.000Z`,
  status,
  voidedAt,
});

describe('closeStatus', () => {
  it('marks seven days ending today, oldest first', () => {
    const r = closeStatus([s('2026-11-02'), s('2026-11-07')], today);
    expect(r.week).toEqual([
      'closed',
      'none',
      'none',
      'none',
      'none',
      'closed',
      'none',
    ]);
    expect(r.line).toBe('Open today');
    expect(r.behind).toBe(false);
  });

  it('flags a shop whose yesterday is not closed', () => {
    const r = closeStatus([s('2026-11-07', 'DRAFT')], today);
    expect(r.behind).toBe(true);
    expect(r.line).toBe('Open · yesterday not closed');
  });

  it('reports today first when it exists', () => {
    expect(closeStatus([s(today)], today).line).toBe('Closed today');
    expect(closeStatus([s(today, 'DRAFT')], today).line).toMatch(/^Draft/);
  });

  it('ignores voided summaries', () => {
    const r = closeStatus([s('2026-11-07', 'FINALIZED', 'x')], today);
    expect(r.week[5]).toBe('none');
  });
});
