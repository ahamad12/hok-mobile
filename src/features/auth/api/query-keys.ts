/** Colocated TanStack Query keys for the auth feature. */
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
  invitations: () => [...authKeys.all, 'invitations'] as const,
};
