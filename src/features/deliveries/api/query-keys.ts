import { DeliveryFilters } from './deliveries.types';

export const deliveryKeys = {
  shop: (shopId: string) => ['deliveries', shopId] as const,
  list: (shopId: string, filters: DeliveryFilters = {}) =>
    [...deliveryKeys.shop(shopId), 'list', filters] as const,
  outstanding: (shopId: string) =>
    [...deliveryKeys.shop(shopId), 'outstanding'] as const,
  detail: (id: string) => ['delivery', id] as const,
  suppliers: (shopId: string) => ['suppliers', shopId] as const,
  categories: (shopId: string) => ['categories', shopId] as const,
};
