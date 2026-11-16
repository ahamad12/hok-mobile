export const formKeys = {
  shop: (shopId: string) => ['forms', shopId] as const,
  detail: (id: string) => ['form', id] as const,
  submissions: (id: string) => ['form', id, 'submissions'] as const,
};
