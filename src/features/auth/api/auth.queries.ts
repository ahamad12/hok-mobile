import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn, useUser } from '../hooks/useAuth';
import { getInvitations, getProfile, getSessions } from './auth.api';
import { authKeys } from './query-keys';

// All gated on signed-in status so a signed-out boot never fires a doomed request.

export const useAuthProfile = () =>
  useQuery({
    queryKey: authKeys.profile(),
    queryFn: getProfile,
    enabled: useIsSignedIn(),
    staleTime: 1000 * 60 * 5,
  });

export const useSessions = () =>
  useQuery({
    queryKey: authKeys.sessions(),
    queryFn: getSessions,
    enabled: useIsSignedIn(),
  });

/** OWNER/MANAGER only — the server rejects STAFF. */
export const usePendingInvitations = () => {
  const signedIn = useIsSignedIn();
  const role = useUser()?.role;
  return useQuery({
    queryKey: authKeys.invitations(),
    queryFn: () => getInvitations('PENDING'),
    enabled: signedIn && (role === 'OWNER' || role === 'MANAGER'),
  });
};
