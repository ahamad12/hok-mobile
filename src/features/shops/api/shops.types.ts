// Mirrors tapt-api packages/api/src/contracts/shop.contract.ts — keep in sync
// manually until the mobile app consumes the shared contracts package.
import { UserRole } from '@/features/auth/api/auth.types';

export type ShopAddress = {
  street: string;
  city: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

export type Shop = {
  id: string;
  name: string;
  address: ShopAddress;
  phone: string;
  logoUrl: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShopStaffMember = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isSupervisor: boolean;
  isActive: boolean;
};

export type CreateShopInput = {
  name: string;
  address: ShopAddress;
  phone: string;
};

export type UpdateShopInput = Partial<CreateShopInput & { isActive: boolean }>;
