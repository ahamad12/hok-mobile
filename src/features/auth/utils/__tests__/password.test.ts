import {
  getPasswordViolations,
  isPasswordStrong,
} from '@/features/auth/utils/password';

describe('password strength (mirrors server guide §7)', () => {
  it('accepts a strong password', () => {
    expect(isPasswordStrong('Abcdef1!')).toBe(true);
    expect(getPasswordViolations('Abcdef1!')).toEqual([]);
  });

  it('flags each missing class', () => {
    expect(getPasswordViolations('short')).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/between 8 and 128/i),
        expect.stringMatching(/uppercase/i),
        expect.stringMatching(/digit/i),
        expect.stringMatching(/special/i),
      ]),
    );
    expect(getPasswordViolations('ALLLOWER1!')).toEqual(
      expect.arrayContaining([expect.stringMatching(/lowercase/i)]),
    );
  });

  it('rejects over-long passwords', () => {
    expect(isPasswordStrong(`${'Aa1!'}${'x'.repeat(125)}`)).toBe(false);
  });
});
