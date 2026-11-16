import { UserProfile } from '@/features/auth/api/auth.types';

export type Shell = 'oversight' | 'shift';
export type Landing = 'today' | 'shift';
/** Which five-tab bar the user gets inside a shop. */
export type Bar = 'oversight' | 'supervisor' | 'staff';

/**
 * Pushed pages that are not open to every role. Anything not listed here
 * is open to everyone in the shop.
 */
export type GatedPage =
  | 'edit'
  | 'staff'
  | 'suppliers'
  | 'categories'
  | 'expenses'
  | 'licenses'
  | 'finance'
  | 'records';

export type Capabilities = {
  /** Owners/managers oversee; supervisors and staff work the shift. */
  shell: Shell;
  bar: Bar;
  landing: Landing;
  /** Manages and the business has 2+ shops (switcher shown). */
  canSwitchShop: boolean;
  /** OWNER only: edit details, deactivate (header ⋯ menu). */
  canManageShop: boolean;
  canFinalizeDay: boolean;
  canDraftDay: boolean;
  canUseTill: boolean;
  canViewProfit: boolean;
  /** Server: STAFF cannot assign; only ISSUE tickets, only to shop STAFF. */
  canAssignTickets: boolean;
  /** Staff may only take or hold their own tasks. */
  canAssignAnyTask: boolean;
  canBroadcast: boolean;
  /** Payment writes are server-gated to OWNER/MANAGER; the UI also hides amounts. */
  canViewPayments: boolean;
  canManageTeam: boolean;
  canInviteManagers: boolean;
  /** Supervisors and up; plain staff never see licences. */
  canViewLicenses: boolean;
  /** Pages from GatedPage this user may open. */
  pages: Record<GatedPage, boolean>;
};

type Who = Pick<UserProfile, 'role' | 'isSupervisor'> | null | undefined;

/**
 * Single source of truth for what the signed-in user sees and may do in a
 * shop. UI gating only: the server stays the gate.
 */
export function capabilitiesFor(user: Who, shopCount: number): Capabilities {
  const isOwner = user?.role === 'OWNER';
  const manages = isOwner || user?.role === 'MANAGER';
  const supervises = manages || (user?.role === 'STAFF' && !!user.isSupervisor);

  const supervisorOnly = supervises && !manages;
  const pages: Record<GatedPage, boolean> = {
    edit: isOwner,
    staff: manages,
    suppliers: manages,
    categories: manages,
    expenses: manages,
    licenses: supervises,
    finance: manages,
    records: manages,
  };

  return {
    shell: manages ? 'oversight' : 'shift',
    bar: manages ? 'oversight' : supervisorOnly ? 'supervisor' : 'staff',
    landing: manages ? 'today' : 'shift',
    canSwitchShop: manages && shopCount > 1,
    canManageShop: isOwner,
    canFinalizeDay: manages,
    canDraftDay: supervises,
    canUseTill: supervises,
    // The API lets supervisors read profit; the business keeps it to managers.
    canViewProfit: manages,
    canAssignTickets: manages,
    canAssignAnyTask: manages,
    canBroadcast: manages,
    canViewPayments: manages,
    canManageTeam: manages,
    canInviteManagers: isOwner,
    canViewLicenses: supervises,
    pages,
  };
}

/** Tab route each landing opens. */
export const LANDING_ROUTE: Record<Landing, Landing> = {
  today: 'today',
  shift: 'shift',
};

/**
 * Where the app opens after sign-in: staff go into their shop, owners and
 * managers with exactly one shop go into it, everyone else to Your hoks.
 */
export function entryHref(
  user: (Who & { shopId?: string | null }) | null | undefined,
  shopIds: string[],
): { shopId: string } | 'shops' {
  if (user?.role === 'STAFF') {
    return user.shopId ? { shopId: user.shopId } : 'shops';
  }
  return shopIds.length === 1 ? { shopId: shopIds[0] } : 'shops';
}
