import { useQueries, useQuery } from '@tanstack/react-query';

import { useIsSignedIn } from '@/features/auth/hooks/useAuth';

import {
  getCategories,
  getDeliveries,
  getDelivery,
  getSupplierOutstanding,
  getSuppliers,
} from './deliveries.api';
import { DeliveryFilters, Supplier } from './deliveries.types';
import { deliveryKeys } from './query-keys';

export const useDeliveries = (shopId: string, filters: DeliveryFilters = {}) =>
  useQuery({
    queryKey: deliveryKeys.list(shopId, filters),
    queryFn: () => getDeliveries(shopId, filters),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useDelivery = (id?: string) =>
  useQuery({
    queryKey: deliveryKeys.detail(id ?? ''),
    queryFn: () => getDelivery(id as string),
    enabled: useIsSignedIn() && !!id,
  });

export const useSupplierOutstanding = (shopId: string) =>
  useQuery({
    queryKey: deliveryKeys.outstanding(shopId),
    queryFn: () => getSupplierOutstanding(shopId),
    enabled: useIsSignedIn() && !!shopId,
  });

export const useSuppliers = (shopId: string) =>
  useQuery({
    queryKey: deliveryKeys.suppliers(shopId),
    queryFn: () => getSuppliers(shopId),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 60 * 5,
  });

/** Supplier names by id, for labelling deliveries. */
export const useSupplierLookup = (shopId: string) => {
  const list = useSuppliers(shopId).data ?? [];
  const byId = new Map<string, Supplier>(list.map((s) => [s.id, s]));
  return (id: string) => byId.get(id);
};

export const useCategories = (shopId: string) =>
  useQuery({
    queryKey: deliveryKeys.categories(shopId),
    queryFn: () => getCategories(shopId),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 60 * 5,
  });

/** Details (with line items) for a bounded set of deliveries, e.g. one day's. */
export const useDeliveryDetails = (ids: string[]) => {
  const signedIn = useIsSignedIn();
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: deliveryKeys.detail(id),
      queryFn: () => getDelivery(id),
      enabled: signedIn && !!id,
    })),
  });
};
