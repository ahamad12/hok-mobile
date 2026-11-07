import { useLocalSearchParams } from 'expo-router';

import { useUser } from '@/features/auth/hooks/useAuth';

import { useMyShops, useShop } from '../api/shops.queries';

/** The `[shopId]` route segment of the shop area. */
export function useShopId(): string {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  return Array.isArray(shopId) ? shopId[0] : (shopId ?? '');
}

/**
 * What the signed-in user may do inside the current shop. Mirrors the
 * server's @Roles guards so the UI hides actions it would reject.
 */
export function useShopRole() {
  const user = useUser();
  const role = user?.role;
  const isOwner = role === 'OWNER';
  const isManager = role === 'MANAGER';
  const isStaff = role === 'STAFF';
  const manages = isOwner || isManager;
  return {
    user,
    isOwner,
    isManager,
    isStaff,
    /** OWNER/MANAGER: voids, reversals, payments, setup screens. */
    manages,
    /** Supervisors may save a day's draft summary; only managers finalize. */
    canDraftClose: manages || (isStaff && !!user?.isSupervisor),
    canFinalize: manages,
    /** Staff have no tenant level: they live inside their one shop. */
    hasTenantLevel: manages,
  };
}

export function useCurrentShop() {
  const shopId = useShopId();
  const shop = useShop(shopId);
  const mine = useMyShops();
  return {
    shopId,
    shop: shop.data ?? mine.data?.find((s) => s.id === shopId),
    query: shop,
  };
}
