jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('react-native', () => ({ AppState: {} }));

import { sinceLabel } from '../useSinceLastSeen';

describe('sinceLabel', () => {
  const now = new Date('2026-11-09T19:00:00').getTime();

  it('hides when there is no earlier visit', () => {
    expect(sinceLabel(null, now)).toBeNull();
  });

  it('hides when away less than 30 minutes', () => {
    expect(sinceLabel(now - 29 * 60 * 1000, now)).toBeNull();
  });

  it('shows the time after a 30+ minute gap', () => {
    expect(sinceLabel(now - 50 * 60 * 1000, now)).toMatch(/^Since /);
  });
});
