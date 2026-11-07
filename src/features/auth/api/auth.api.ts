import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ApiResponse, unwrap } from '@/constants/ApiResponse';
import { ENDPOINTS } from '@/constants/Endpoints';
import { authedClient, unauthedClient } from '@/services/httpClient';

import {
  AcceptInvitationInput,
  AuthGrant,
  ChangePasswordInput,
  ChangePasswordResponse,
  CreateInvitationInput,
  Invitation,
  InvitationStatus,
  LoginInput,
  RegisterInput,
  Session,
  UpdateProfileInput,
  UserProfile,
} from './auth.types';

/** Shown in the server's session list ("Pixel 8", "iPhone"). */
const deviceName = (Constants.deviceName ?? Platform.OS).slice(0, 100);

// --- Public (no bearer, never enters the 401-refresh loop) ---------------

export async function login(input: LoginInput): Promise<AuthGrant> {
  const res = await unauthedClient.post<ApiResponse<AuthGrant>>(
    ENDPOINTS.AUTH.LOGIN,
    { ...input, deviceName },
  );
  return unwrap(res);
}

/** Public sign-up always creates an OWNER and signs them in. */
export async function register(input: RegisterInput): Promise<AuthGrant> {
  const res = await unauthedClient.post<ApiResponse<AuthGrant>>(
    ENDPOINTS.AUTH.REGISTER,
    { ...input, deviceName },
  );
  return unwrap(res);
}

/** Invitee sets name + password from the email link and is signed in. */
export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<AuthGrant> {
  const res = await unauthedClient.post<ApiResponse<AuthGrant>>(
    ENDPOINTS.INVITATIONS.ACCEPT,
    { ...input, deviceName },
  );
  return unwrap(res);
}

// --- Profile --------------------------------------------------------------

export async function getProfile(): Promise<UserProfile> {
  return unwrap(
    await authedClient.get<ApiResponse<UserProfile>>(ENDPOINTS.AUTH.PROFILE),
  );
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  return unwrap(
    await authedClient.patch<ApiResponse<UserProfile>>(
      ENDPOINTS.AUTH.PROFILE,
      input,
    ),
  );
}

/** Success revokes every session server-side, this device included. */
export async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
  return unwrap(
    await authedClient.post<ApiResponse<ChangePasswordResponse>>(
      ENDPOINTS.AUTH.CHANGE_PASSWORD,
      input,
    ),
  );
}

// --- Sessions ---------------------------------------------------------------

export async function getSessions(): Promise<Session[]> {
  const res = await authedClient.get<ApiResponse<{ sessions: Session[] }>>(
    ENDPOINTS.AUTH.SESSIONS,
  );
  return unwrap(res).sessions;
}

export async function revokeSession(id: string): Promise<void> {
  await authedClient.delete(ENDPOINTS.AUTH.SESSION(id), { data: {} });
}

export async function logoutAll(): Promise<void> {
  await authedClient.post(ENDPOINTS.AUTH.LOGOUT_ALL, {});
}

// --- Invitations -------------------------------------------------------------

export async function createInvitation(
  input: CreateInvitationInput,
): Promise<Invitation> {
  return unwrap(
    await authedClient.post<ApiResponse<Invitation>>(
      ENDPOINTS.INVITATIONS.CREATE,
      input,
    ),
  );
}

export async function getInvitations(
  status?: InvitationStatus,
): Promise<Invitation[]> {
  const res = await authedClient.get<
    ApiResponse<{ invitations: Invitation[]; total: number }>
  >(ENDPOINTS.INVITATIONS.LIST, { params: { status, limit: 100 } });
  return unwrap(res).invitations;
}

export async function resendInvitation(id: string): Promise<Invitation> {
  return unwrap(
    await authedClient.post<ApiResponse<Invitation>>(
      ENDPOINTS.INVITATIONS.RESEND(id),
      {},
    ),
  );
}

export async function revokeInvitation(id: string): Promise<Invitation> {
  return unwrap(
    await authedClient.delete<ApiResponse<Invitation>>(
      ENDPOINTS.INVITATIONS.REVOKE(id),
      { data: {} },
    ),
  );
}
