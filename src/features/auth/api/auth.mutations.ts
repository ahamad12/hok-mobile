import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  endSession,
  getSessionGeneration,
  startSession,
  updateSessionUser,
} from '../session/sessionManager';
import {
  acceptInvitation,
  changePassword,
  createInvitation,
  getProfile,
  login,
  logoutAll,
  register,
  resendInvitation,
  revokeInvitation,
  revokeSession,
  updateProfile,
} from './auth.api';
import {
  AcceptInvitationInput,
  AuthGrant,
  ChangePasswordInput,
  CreateInvitationInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from './auth.types';
import { authKeys } from './query-keys';

/**
 * Start the session from a grant, then hydrate the fuller profile. A
 * hydration failure doesn't invalidate the session; a sign-out that lands
 * mid-hydration wins (generation check).
 */
async function signInWith(grant: AuthGrant): Promise<void> {
  await startSession(grant);
  const g = getSessionGeneration();
  try {
    updateSessionUser(await getProfile(), g);
  } catch {
    // Keep the summary user; the profile query retries on next read.
  }
}

// Screens render errors inline, so these skip the global error toast.
const silent = { silent: true };

const useGrantMutation = <T,>(fn: (input: T) => Promise<AuthGrant>) =>
  useMutation({
    mutationFn: async (input: T) => signInWith(await fn(input)),
    meta: silent,
  });

export const useLogin = () => useGrantMutation<LoginInput>(login);
export const useRegister = () => useGrantMutation<RegisterInput>(register);
export const useAcceptInvitation = () =>
  useGrantMutation<AcceptInvitationInput>(acceptInvitation);

export const useLogout = () =>
  useMutation({ mutationFn: () => endSession('logout') });

export const useLogoutAll = () =>
  useMutation({
    mutationFn: logoutAll,
    // Server already revoked this device too — no logout call needed.
    onSuccess: () => endSession('revoked'),
  });

export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.sessions() }),
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    meta: silent,
    onSuccess: (profile) => {
      qc.setQueryData(authKeys.profile(), profile);
      updateSessionUser(profile, getSessionGeneration());
    },
  });
};

/** Success signs out every device, this one included, immediately. */
export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
    meta: silent,
    onSuccess: () => endSession('password-changed'),
  });

export const useCreateInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvitationInput) => createInvitation(input),
    meta: silent,
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.invitations() }),
  });
};

export const useResendInvitation = () =>
  useMutation({ mutationFn: resendInvitation });

export const useRevokeInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.invitations() }),
  });
};
