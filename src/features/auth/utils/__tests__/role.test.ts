import {
  canAccessAllShops,
  getRoleShopInvariantViolation,
  hasSupervisorAccess,
} from '@/features/auth/utils/role';

describe('getRoleShopInvariantViolation', () => {
  it('rejects OWNER with a shop', () => {
    expect(
      getRoleShopInvariantViolation({ role: 'OWNER', shopId: 's1' }),
    ).toMatch(/owner/i);
  });

  it('rejects MANAGER with a shop (system-wide role)', () => {
    expect(
      getRoleShopInvariantViolation({ role: 'MANAGER', shopId: 's1' }),
    ).toMatch(/manager/i);
  });

  it('rejects supervisor flag on non-STAFF roles', () => {
    expect(
      getRoleShopInvariantViolation({ role: 'OWNER', isSupervisor: true }),
    ).toMatch(/only staff/i);
    expect(
      getRoleShopInvariantViolation({ role: 'MANAGER', isSupervisor: true }),
    ).toMatch(/only staff/i);
  });

  it('rejects supervisor STAFF without a shop', () => {
    expect(
      getRoleShopInvariantViolation({
        role: 'STAFF',
        isSupervisor: true,
        shopId: null,
      }),
    ).toMatch(/supervisor must be assigned/i);
  });

  it('accepts valid assignments', () => {
    expect(getRoleShopInvariantViolation({ role: 'OWNER' })).toBeNull();
    expect(getRoleShopInvariantViolation({ role: 'MANAGER' })).toBeNull();
    expect(
      getRoleShopInvariantViolation({ role: 'STAFF', shopId: 's1' }),
    ).toBeNull();
    expect(
      getRoleShopInvariantViolation({
        role: 'STAFF',
        shopId: 's1',
        isSupervisor: true,
      }),
    ).toBeNull();
  });
});

describe('canAccessAllShops', () => {
  it.each([['OWNER'], ['MANAGER']] as const)('%s sees everything', (role) => {
    expect(canAccessAllShops(role)).toBe(true);
  });

  it('STAFF is shop-scoped', () => {
    expect(canAccessAllShops('STAFF')).toBe(false);
  });
});

describe('hasSupervisorAccess', () => {
  it('OWNER/MANAGER bypass regardless of flag', () => {
    expect(hasSupervisorAccess('OWNER', false)).toBe(true);
    expect(hasSupervisorAccess('MANAGER', false)).toBe(true);
  });

  it('STAFF needs the supervisor flag', () => {
    expect(hasSupervisorAccess('STAFF', true)).toBe(true);
    expect(hasSupervisorAccess('STAFF', false)).toBe(false);
  });
});
