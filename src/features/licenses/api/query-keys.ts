export const licenseKeys = {
  shop: (shopId: string) => ['licenses', shopId] as const,
  list: (shopId: string) => [...licenseKeys.shop(shopId), 'list'] as const,
  expiring: (shopId: string) =>
    [...licenseKeys.shop(shopId), 'expiring'] as const,
  detail: (id: string) => ['license', id] as const,
  renewals: (id: string) => ['license', id, 'renewals'] as const,
};
