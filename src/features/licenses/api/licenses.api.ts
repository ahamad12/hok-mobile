import { ENDPOINTS } from '@/constants/Endpoints';
import { apiGet, apiPatch, apiPost } from '@/services/apiRequest';

import {
  CreateLicenseInput,
  License,
  LicenseRenewal,
  RenewalInput,
  UpdateLicenseInput,
} from './licenses.types';

const L = ENDPOINTS.LICENSES;

export const getLicenses = (shopId: string) =>
  apiGet<{ licenses: License[]; total: number }>(L.LIST, {
    shopId,
    limit: 100,
  });

/** Active licences inside their reminder window or already expired. */
export async function getExpiringLicenses(shopId: string): Promise<License[]> {
  return (await apiGet<{ licenses: License[] }>(L.EXPIRING, { shopId }))
    .licenses;
}

export const getLicense = (id: string) => apiGet<License>(L.BY_ID(id));

/** OWNER/MANAGER. Records the INITIAL renewal in the same call. */
export const createLicense = (input: CreateLicenseInput) =>
  apiPost<License>(L.CREATE, input);

/** OWNER/MANAGER. */
export const updateLicense = (id: string, input: UpdateLicenseInput) =>
  apiPatch<License>(L.UPDATE(id), input);

/** OWNER/MANAGER. */
export const renewLicense = (id: string, input: RenewalInput) =>
  apiPost<{ license: License; renewal: LicenseRenewal }>(L.RENEW(id), input);

export async function getRenewals(id: string): Promise<LicenseRenewal[]> {
  return (await apiGet<{ renewals: LicenseRenewal[] }>(L.RENEWALS(id)))
    .renewals;
}

/** OWNER/MANAGER. */
export const voidRenewal = (
  id: string,
  renewalId: string,
  voidReason: string,
) =>
  apiPost<{ license: License; renewal: LicenseRenewal }>(
    L.VOID_RENEWAL(id, renewalId),
    { voidReason },
  );
