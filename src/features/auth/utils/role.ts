import { UserRole } from '../api/auth.types';

export function getRoleShopInvariantViolation(input: {
  role: UserRole;
  shopId?: string | null;
  isSupervisor?: boolean;
}): string | null {
  const { role, shopId, isSupervisor } = input;

  if (role === 'OWNER' && shopId) {
    return 'Owners cannot be assigned to a shop.';
  }
  if (role === 'MANAGER' && shopId) {
    return 'Managers cannot be assigned to a shop (system-wide role).';
  }
  if (isSupervisor && role !== 'STAFF') {
    return 'Only staff can be marked as a supervisor.';
  }
  if (isSupervisor && !shopId) {
    return 'A supervisor must be assigned to a shop.';
  }

  return null;
}

/** Gating helper for shop-scoped views: OWNER/MANAGER see everything. */
export function canAccessAllShops(role: UserRole): boolean {
  return role === 'OWNER' || role === 'MANAGER';
}

/** Mirrors @RequireSupervisorOrAbove(): OWNER/MANAGER bypass, else needs isSupervisor. */
export function hasSupervisorAccess(
  role: UserRole,
  isSupervisor: boolean,
): boolean {
  return role !== 'STAFF' || isSupervisor;
}

/** Roles the caller may invite: OWNER → MANAGER/STAFF, MANAGER → STAFF. */
export function invitableRoles(role: UserRole): ('MANAGER' | 'STAFF')[] {
  if (role === 'OWNER') return ['MANAGER', 'STAFF'];
  if (role === 'MANAGER') return ['STAFF'];
  return [];
}

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

export const roleLabel = (role: UserRole): string => ROLE_LABELS[role] ?? role;
