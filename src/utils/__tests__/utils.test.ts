import { getDeviceKind } from '@/features/auth/utils/device';
import { getPasswordChecks } from '@/features/auth/utils/password';
import { getInitials } from '@/utils/initials';
import { daysUntil, formatExpiry, formatRelativeTime } from '@/utils/time';

const NOW = new Date('2026-11-07T12:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const inMs = (ms: number) => new Date(NOW.getTime() + ms).toISOString();
const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe('formatRelativeTime', () => {
  it('buckets recent times', () => {
    expect(formatRelativeTime(ago(10_000), NOW)).toBe('just now');
    expect(formatRelativeTime(ago(5 * MIN), NOW)).toBe('5 min ago');
    expect(formatRelativeTime(ago(3 * 60 * MIN), NOW)).toBe('3 h ago');
    expect(formatRelativeTime(ago(DAY), NOW)).toBe('yesterday');
    expect(formatRelativeTime(ago(3 * DAY), NOW)).toBe('3 days ago');
  });
  it('returns empty for invalid input', () => {
    expect(formatRelativeTime('nope', NOW)).toBe('');
  });
});

describe('expiry', () => {
  it('counts whole days ahead', () => {
    expect(daysUntil(inMs(3 * DAY), NOW)).toBe(3);
    expect(formatExpiry(inMs(3 * DAY), NOW)).toBe('Expires in 3 days');
    expect(formatExpiry(inMs(2 * 60 * MIN), NOW)).toBe('Expires today');
    expect(formatExpiry(ago(MIN), NOW)).toBe('Expired');
  });
});

describe('getDeviceKind', () => {
  it('classifies common user agents', () => {
    expect(getDeviceKind('okhttp/4.9', 'Pixel 8')).toBe('phone');
    expect(getDeviceKind('Mozilla/5.0 (iPad; CPU OS 17_0)', null)).toBe(
      'tablet',
    );
    expect(getDeviceKind('Mozilla/5.0 (Windows NT 10.0; Win64)', null)).toBe(
      'desktop',
    );
    expect(getDeviceKind(null, null)).toBe('unknown');
  });
});

describe('getInitials', () => {
  it('derives initials from names and emails', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
    expect(getInitials('cher')).toBe('C');
    expect(getInitials('jane.doe@x.io')).toBe('JD');
    expect(getInitials('  ')).toBe('?');
    expect(getInitials(null)).toBe('?');
  });
});

describe('getPasswordChecks', () => {
  it('reports each rule', () => {
    const checks = getPasswordChecks('abc');
    expect(checks.find((c) => c.label === 'Lowercase letter')?.ok).toBe(true);
    expect(checks.filter((c) => c.ok)).toHaveLength(1);
    expect(getPasswordChecks('Str0ng!pass').every((c) => c.ok)).toBe(true);
  });
});
