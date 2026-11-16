import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createLicense,
  renewLicense,
  updateLicense,
  voidRenewal,
} from './licenses.api';
import {
  CreateLicenseInput,
  License,
  RenewalInput,
  UpdateLicenseInput,
} from './licenses.types';
import { licenseKeys } from './query-keys';

const useRefresh = (shopId: string) => {
  const qc = useQueryClient();
  return (license?: License) => {
    if (license) qc.setQueryData(licenseKeys.detail(license.id), license);
    return Promise.all([
      qc.invalidateQueries({ queryKey: licenseKeys.shop(shopId) }),
      license
        ? qc.invalidateQueries({ queryKey: licenseKeys.renewals(license.id) })
        : null,
    ]);
  };
};

export const useCreateLicense = (shopId: string) => {
  const refresh = useRefresh(shopId);
  return useMutation({
    mutationFn: (input: Omit<CreateLicenseInput, 'shopId'>) =>
      createLicense({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: (l) => refresh(l),
  });
};

export const useUpdateLicense = (shopId: string, id: string) => {
  const refresh = useRefresh(shopId);
  return useMutation({
    mutationFn: (input: UpdateLicenseInput) => updateLicense(id, input),
    onSuccess: (l) => refresh(l),
  });
};

export const useRenewLicense = (shopId: string, id: string) => {
  const refresh = useRefresh(shopId);
  return useMutation({
    mutationFn: (input: RenewalInput) => renewLicense(id, input),
    meta: { silent: true },
    onSuccess: ({ license }) => refresh(license),
  });
};

export const useVoidRenewal = (shopId: string, id: string) => {
  const refresh = useRefresh(shopId);
  return useMutation({
    mutationFn: ({
      renewalId,
      reason,
    }: {
      renewalId: string;
      reason: string;
    }) => voidRenewal(id, renewalId, reason),
    onSuccess: ({ license }) => refresh(license),
  });
};
