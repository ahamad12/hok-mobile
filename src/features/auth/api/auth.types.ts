// Duplicates the server enum (tapt-api auth.contract.ts) with no drift guard —
// keep in sync manually until the mobile app joins the shared workspace.
export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

export type UserSummary = {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  role: UserRole;
  shopId: string | null;
  isSupervisor: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Public registration collects owner-account fields ONLY. Role/shopId are
 * assigned server-side (OWNER + new workspace); the client cannot send them.
 */
export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
  username?: string;
};

/** Returned by login, register and invitation accept. */
export type AuthGrant = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  user: UserSummary;
};

export type InvitableRole = 'MANAGER' | 'STAFF';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

/** OWNER invites MANAGER/STAFF; MANAGER invites STAFF. Invitee sets their own password. */
export type CreateInvitationInput = {
  email: string;
  role: InvitableRole;
  shopId?: string;
  isSupervisor?: boolean;
};

export type Invitation = {
  id: string;
  email: string;
  role: InvitableRole;
  shopId: string | null;
  isSupervisor: boolean;
  status: InvitationStatus;
  invitedById: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type AcceptInvitationInput = {
  token: string;
  password: string;
  displayName: string;
  username?: string;
};

export type Session = {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export type ShopOption = { id: string; name: string };

/**
 * Returned by GET/PATCH /auth/profile only. Structurally extends
 * UserSummary, so a UserProfile value satisfies anything typed as
 * UserSummary (e.g. authStore.signIn) without extra mapping.
 */
export type UserProfile = UserSummary & {
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  username?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
  /** How many refresh-token rows were revoked server-side, this device included. */
  sessionsRevoked: number;
};

export type AuthStatus = 'signedOut' | 'restoring' | 'signedIn';
