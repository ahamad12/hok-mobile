import { useCallback } from 'react';

import { useShopStaff } from '@/features/shops/api/shops.queries';
import { useCapabilities } from '@/features/shops/hooks/useShopContext';
import { useTeamMembers } from '@/features/team/api/team.queries';

/**
 * Summaries carry user ids only; names come from the team (owners and
 * managers) and the shop's staff. Falls back to "a teammate".
 */
export function usePersonName(shopId: string) {
  const { canManageTeam } = useCapabilities();
  const staff = useShopStaff(canManageTeam ? shopId : null);
  const team = useTeamMembers();

  return useCallback(
    (id: string | null | undefined) =>
      (id &&
        (team.data?.find((m) => m.id === id)?.displayName ??
          staff.data?.find((m) => m.id === id)?.displayName)) ||
      'a teammate',
    [team.data, staff.data],
  );
}
