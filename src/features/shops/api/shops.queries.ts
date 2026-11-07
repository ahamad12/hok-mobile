import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn, useUser } from '@/features/auth/hooks/useAuth';

import { sortShopsByName } from '../utils/shopUtils';
import { shopKeys } from './query-keys';
import { getMyShops, getShop, getShopStaff } from './shops.api';

/**
 * Shops the signed-in user can see: the whole business for OWNER/MANAGER,
 * their own shop for STAFF. Relies on tapt-api serving `GET /shops/my` to
 * every role; older servers 403 for non-owners, which callers handle.
 */
export const useMyShops = () => {
  const signedIn = useIsSignedIn();
  return useQuery({
    queryKey: shopKeys.mine(),
    queryFn: getMyShops,
    enabled: signedIn,
    staleTime: 1000 * 60 * 5,
    select: sortShopsByName,
  });
};

export const useShop = (id?: string | null) =>
  useQuery({
    queryKey: shopKeys.detail(id ?? ''),
    queryFn: () => getShop(id as string),
    enabled: useIsSignedIn() && !!id,
  });

/** OWNER/MANAGER only. */
export const useShopStaff = (id?: string | null) => {
  const signedIn = useIsSignedIn();
  const role = useUser()?.role;
  return useQuery({
    queryKey: shopKeys.staff(id ?? ''),
    queryFn: () => getShopStaff(id as string),
    enabled: signedIn && !!id && (role === 'OWNER' || role === 'MANAGER'),
  });
};
