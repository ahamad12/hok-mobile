import { capabilitiesFor } from '../capabilities';
import { shopTabsFor } from '../shopTabs';

const bar = (role: 'OWNER' | 'MANAGER' | 'STAFF', isSupervisor = false) =>
  shopTabsFor(capabilitiesFor({ role, isSupervisor }, 2))
    .filter((t) => t.visible)
    .map((t) => t.title);

describe('shopTabsFor', () => {
  it('gives owners and managers the oversight bar, in order', () => {
    const oversight = ['Today', 'Work', 'Team', 'Insights', 'Records'];
    expect(bar('OWNER')).toEqual(oversight);
    expect(bar('MANAGER')).toEqual(oversight);
  });

  it('gives supervisors the shift bar with Till', () => {
    expect(bar('STAFF', true)).toEqual([
      'Shift',
      'Till',
      'Scratch',
      'Deliveries',
      'Tasks',
    ]);
  });

  it('gives plain staff the shift bar without Till', () => {
    expect(bar('STAFF')).toEqual(['Shift', 'Scratch', 'Deliveries', 'Tasks']);
  });

  it('never shows more than five tabs', () => {
    for (const r of ['OWNER', 'MANAGER', 'STAFF'] as const) {
      expect(bar(r, true).length).toBeLessThanOrEqual(5);
    }
  });

  it('keeps every route registered, with old tabs hidden', () => {
    const all = shopTabsFor(
      capabilitiesFor({ role: 'OWNER', isSupervisor: false }, 1),
    );
    expect(all.map((t) => t.name)).toEqual(
      expect.arrayContaining(['home', 'money', 'more', 'shift', 'till']),
    );
    expect(all.find((t) => t.name === 'home')?.visible).toBe(false);
  });
});
