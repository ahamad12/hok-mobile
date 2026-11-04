import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn } from '../hooks/useAuth';
import { getInvitations, getMyShops, getProfile, getSessions } from './auth.api';
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

export const usePendingInvitations = () =>
  useQuery({
    queryKey: authKeys.invitations(),
    queryFn: () => getInvitations('PENDING'),
    enabled: useIsSignedIn(),
  });

export const useMyShops = () =>
  useQuery({
    queryKey: authKeys.shops(),
    queryFn: getMyShops,
    enabled: useIsSignedIn(),
    staleTime: 1000 * 60 * 5,
  });
