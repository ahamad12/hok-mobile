import { capabilitiesFor } from '../capabilities';
import { shopTabsFor } from '../shopTabs';

const bar = (role: 'OWNER' | 'MANAGER' | 'STAFF', isSupervisor = false) =>
  shopTabsFor(capabilitiesFor({ role, isSupervisor }, 2))
    .filter((t) => t.visible)
    .map((t) => t.title);

describe('shopTabsFor', () => {
  it('gives owners and managers the oversight bar, in order', () => {
    const oversight = ['Today', 'Work', 'Finance', 'Records', 'More'];
    expect(bar('OWNER')).toEqual(oversight);
    expect(bar('MANAGER')).toEqual(oversight);
  });

  it('gives supervisors Till and Deliveries, with Scratch in More', () => {
    expect(bar('STAFF', true)).toEqual([
      'Shift',
      'Till',
      'Deliveries',
      'Work',
      'More',
    ]);
  });

  it('gives plain staff Scratch and Deliveries, no Till', () => {
    expect(bar('STAFF')).toEqual([
      'Shift',
      'Scratch',
      'Deliveries',
      'Work',
      'More',
    ]);
  });

  it('uses the same Work label and ends with More on every bar', () => {
    for (const [r, s] of [
      ['OWNER', false],
      ['STAFF', true],
      ['STAFF', false],
    ] as const) {
      const b = bar(r, s);
      expect(b).toHaveLength(5);
      expect(b).toContain('Work');
      expect(b.at(-1)).toBe('More');
    }
  });

  it('keeps retired routes registered but hidden', () => {
    const all = shopTabsFor(
      capabilitiesFor({ role: 'OWNER', isSupervisor: false }, 1),
    );
    for (const name of ['home', 'money', 'insights', 'team']) {
      expect(all.find((t) => t.name === name)?.visible).toBe(false);
    }
  });
});
