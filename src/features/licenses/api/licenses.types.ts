// Mirrors tapt-api packages/api/src/contracts/license.contract.ts.

export type License = {
  id: string;
  shopId: string;
  productName: string;
  licenseNumber: string;
  remindDays: number;
  isActive: boolean;
  currentIssueDate: string | null;
  currentExpiryDate: string | null;
  /** Null until a renewal exists. */
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LicenseRenewal = {
  id: string;
  licenseId: string;
  source: 'INITIAL' | 'RENEWAL';
  issueDate: string;
  expiryDate: string;
  paymentAmount: number | null;
  paymentDate: string | null;
  documentUrl: string | null;
  notes: string | null;
  recordedById: string;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
};

export type RenewalInput = {
  issueDate: string;
  expiryDate: string;
  paymentAmount?: number;
  paymentDate?: string;
  notes?: string;
};

export type CreateLicenseInput = RenewalInput & {
  shopId: string;
  productName: string;
  licenseNumber: string;
  remindDays?: number;
};

export type UpdateLicenseInput = {
  productName?: string;
  licenseNumber?: string;
  remindDays?: number;
  isActive?: boolean;
};
