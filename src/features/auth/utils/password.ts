const SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>]/;
const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

export function getPasswordViolations(password: string): string[] {
  const violations: string[] = [];

  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    violations.push(
      `Must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`,
    );
  }
  if (!/[A-Z]/.test(password))
    violations.push('Must contain an uppercase letter.');
  if (!/[a-z]/.test(password))
    violations.push('Must contain a lowercase letter.');
  if (!/[0-9]/.test(password)) violations.push('Must contain a digit.');
  if (!SPECIAL_CHARS.test(password)) {
    violations.push('Must contain a special character (!@#$%^&*(),.?":{}|<>).');
  }

  return violations;
}

export const isPasswordStrong = (password: string): boolean =>
  getPasswordViolations(password).length === 0;

export type PasswordCheck = { label: string; ok: boolean };

/** Per-rule pass/fail list for a live strength checklist. Same rules as above. */
export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    {
      label: `${MIN_LENGTH}+ characters`,
      ok: password.length >= MIN_LENGTH && password.length <= MAX_LENGTH,
    },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: SPECIAL_CHARS.test(password) },
  ];
}
