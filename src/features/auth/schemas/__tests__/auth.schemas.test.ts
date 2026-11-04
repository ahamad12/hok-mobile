import {
  changePasswordSchema,
  createInvitationSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '@/features/auth/schemas/auth.schemas';

describe('loginSchema', () => {
  it('accepts valid input and rejects blanks before any network call', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: 'a@b.co', password: '' }).success,
    ).toBe(false);
  });

  it('applies no strength rule on login (server allows min(1))', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.co', password: 'weak' }).success,
    ).toBe(true);
  });
});

describe('registerSchema (Step 1: owner-only fields)', () => {
  const owner = {
    email: 'owner@example.com',
    password: 'Strong1!',
    displayName: 'Owner',
  };

  it('accepts owner fields', () => {
    expect(registerSchema.safeParse(owner).success).toBe(true);
  });

  it('rejects weak passwords inline', () => {
    const result = registerSchema.safeParse({ ...owner, password: 'weak' });
    expect(result.success).toBe(false);
  });

  it('cannot carry role/shopId — unknown keys are stripped, never typed', () => {
    const parsed = registerSchema.parse({
      ...owner,
      role: 'MANAGER',
      shopId: 's1',
    });
    expect(parsed).not.toHaveProperty('role');
    expect(parsed).not.toHaveProperty('shopId');
  });
});

describe('changePasswordSchema', () => {
  it('rejects weak or identical new passwords', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Old1!xxxx',
        newPassword: 'weak',
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Same1!xx',
        newPassword: 'Same1!xx',
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Old1!xxxx',
        newPassword: 'New2@yyyy',
      }).success,
    ).toBe(true);
  });
});

describe('updateProfileSchema', () => {
  it('accepts partial updates', () => {
    expect(updateProfileSchema.safeParse({ displayName: 'New' }).success).toBe(
      true,
    );
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });
});

describe('createInvitationSchema (invite-only MANAGER/STAFF)', () => {
  const base = {
    email: 'staff@example.com',
    password: 'Strong1!',
    displayName: 'Staff',
  };

  it('accepts MANAGER without a shop and STAFF with one', () => {
    expect(
      createInvitationSchema.safeParse({ ...base, role: 'MANAGER' }).success,
    ).toBe(true);
    expect(
      createInvitationSchema.safeParse({ ...base, role: 'STAFF', shopId: 's1' })
        .success,
    ).toBe(true);
  });

  it('rejects MANAGER with a shop (system-wide role)', () => {
    expect(
      createInvitationSchema.safeParse({ ...base, role: 'MANAGER', shopId: 's1' })
        .success,
    ).toBe(false);
  });

  it('rejects supervisor STAFF without a shop', () => {
    expect(
      createInvitationSchema.safeParse({
        ...base,
        role: 'STAFF',
        isSupervisor: true,
      }).success,
    ).toBe(false);
  });
});
