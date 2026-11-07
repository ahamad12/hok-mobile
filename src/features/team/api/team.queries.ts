import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn, useUser } from '@/features/auth/hooks/useAuth';

import { teamKeys } from './query-keys';
import { getTeamMembers } from './team.api';

/** Everyone in the business. OWNER/MANAGER only (server: GET /team/members). */
export const useTeamMembers = () => {
  const signedIn = useIsSignedIn();
  const role = useUser()?.role;
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: getTeamMembers,
    enabled: signedIn && (role === 'OWNER' || role === 'MANAGER'),
  });
};
