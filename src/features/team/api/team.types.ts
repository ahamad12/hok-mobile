// Mirrors tapt-api packages/api/src/contracts/team.contract.ts.
import { UserRole } from '@/features/auth/api/auth.types';

export type TeamMember = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  /** STAFF only; null for the owner and managers (tenant-wide). */
  shopId: string | null;
  isSupervisor: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};
