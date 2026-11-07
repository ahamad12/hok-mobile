/** Colocated TanStack Query keys for the shops feature. */
export const shopKeys = {
  all: ['shops'] as const,
  mine: () => [...shopKeys.all, 'mine'] as const,
  detail: (id: string) => [...shopKeys.all, 'detail', id] as const,
  staff: (id: string) => [...shopKeys.all, 'staff', id] as const,
};
