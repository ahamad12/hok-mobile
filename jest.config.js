// Restored minimal config (2026-09-23, T2): the repo's tests import via the
// `@/` alias and depend on node-module mocks, but jest.config.js had been
// deleted, so every suite using `@/` failed at resolution. This file restores
// only what's needed to run `src/**/__tests__` — full toolchain hardening
// (env-cmd scripts, jest types, coverage) stays in the C1 governance track.
module.exports = {
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
