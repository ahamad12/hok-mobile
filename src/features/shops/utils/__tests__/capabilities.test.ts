import { capabilitiesFor, entryHref } from '../capabilities';

const owner = { role: 'OWNER' as const, isSupervisor: false, shopId: null };
const manager = { role: 'MANAGER' as const, isSupervisor: false, shopId: null };
const supervisor = { role: 'STAFF' as const, isSupervisor: true, shopId: 's1' };
const staff = { role: 'STAFF' as const, isSupervisor: false, shopId: 's1' };

describe('capabilitiesFor', () => {
  it('puts owners and managers in the oversight shell', () => {
    expect(capabilitiesFor(owner, 1)).toMatchObject({
      shell: 'oversight',
      landing: 'today',
    });
    expect(capabilitiesFor(manager, 1).shell).toBe('oversight');
  });

  it('puts supervisors and staff in the shift shell', () => {
    expect(capabilitiesFor(supervisor, 1)).toMatchObject({
      shell: 'shift',
      landing: 'shift',
    });
    expect(capabilitiesFor(staff, 1).shell).toBe('shift');
  });

  it('shows the shop switcher only to managers of 2+ shops', () => {
    expect(capabilitiesFor(owner, 1).canSwitchShop).toBe(false);
    expect(capabilitiesFor(owner, 2).canSwitchShop).toBe(true);
    expect(capabilitiesFor(manager, 3).canSwitchShop).toBe(true);
    expect(capabilitiesFor(staff, 3).canSwitchShop).toBe(false);
  });

  it('gives each role its bar', () => {
    expect(capabilitiesFor(owner, 1).bar).toBe('oversight');
    expect(capabilitiesFor(manager, 1).bar).toBe('oversight');
    expect(capabilitiesFor(supervisor, 1).bar).toBe('supervisor');
    expect(capabilitiesFor(staff, 1).bar).toBe('staff');
  });

  it('gives supervisors till and draft, but not finalize or profit', () => {
    const c = capabilitiesFor(supervisor, 1);
    expect(c.canUseTill && c.canDraftDay && c.canViewLicenses).toBe(true);
    expect(c.canViewProfit).toBe(false);
    expect(c.canFinalizeDay).toBe(false);
    expect(c.canAssignTickets).toBe(false);
    expect(c.canViewPayments).toBe(false);
  });

  it('gives plain staff none of the supervisor powers', () => {
    const c = capabilitiesFor(staff, 1);
    expect(c.canUseTill || c.canDraftDay || c.canViewProfit).toBe(false);
    expect(c.canViewLicenses).toBe(false);
  });

  it('opens gated pages by role', () => {
    const open = (u: Parameters<typeof capabilitiesFor>[0]) =>
      Object.entries(capabilitiesFor(u, 1).pages)
        .filter(([, ok]) => ok)
        .map(([p]) => p)
        .sort();
    expect(open(owner)).toEqual(
      ['categories', 'edit', 'expenses', 'finance', 'licenses', 'records', 'staff', 'suppliers'],
    );
    expect(open(manager)).not.toContain('edit');
    expect(open(supervisor)).toEqual(['licenses']);
    expect(open(staff)).toEqual([]);
  });

  it('keeps shop settings and manager invites to the owner', () => {
    expect(capabilitiesFor(owner, 1).canManageShop).toBe(true);
    expect(capabilitiesFor(manager, 1).canManageShop).toBe(false);
    expect(capabilitiesFor(owner, 1).canInviteManagers).toBe(true);
    expect(capabilitiesFor(manager, 1).canInviteManagers).toBe(false);
  });

  it('grants nothing when signed out', () => {
    const c = capabilitiesFor(null, 0);
    expect(c.shell).toBe('shift');
    expect(Object.values(c).filter((v) => v === true)).toHaveLength(0);
    expect(Object.values(c.pages).some(Boolean)).toBe(false);
  });
});

describe('entryHref', () => {
  it('sends staff into their shop', () => {
    expect(entryHref(staff, [])).toEqual({ shopId: 's1' });
  });

  it('sends a one-shop owner or manager into that shop', () => {
    expect(entryHref(owner, ['a'])).toEqual({ shopId: 'a' });
    expect(entryHref(manager, ['a'])).toEqual({ shopId: 'a' });
  });

  it('sends owners with none or several shops to Your hoks', () => {
    expect(entryHref(owner, [])).toBe('shops');
    expect(entryHref(owner, ['a', 'b'])).toBe('shops');
  });

  it('sends staff without a shop to the shops screen (it explains)', () => {
    expect(entryHref({ ...staff, shopId: null }, [])).toBe('shops');
  });
});
