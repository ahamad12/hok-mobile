import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn } from '@/features/auth/hooks/useAuth';

import {
  getExpiringLicenses,
  getLicense,
  getLicenses,
  getRenewals,
} from './licenses.api';
import { licenseKeys } from './query-keys';

export const useLicenses = (shopId: string) =>
  useQuery({
    queryKey: licenseKeys.list(shopId),
    queryFn: () => getLicenses(shopId),
    enabled: useIsSignedIn() && !!shopId,
  });

export const useExpiringLicenses = (shopId: string) =>
  useQuery({
    queryKey: licenseKeys.expiring(shopId),
    queryFn: () => getExpiringLicenses(shopId),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 60 * 10,
  });

export const useLicense = (id?: string) =>
  useQuery({
    queryKey: licenseKeys.detail(id ?? ''),
    queryFn: () => getLicense(id as string),
    enabled: useIsSignedIn() && !!id,
  });

export const useRenewals = (id?: string) =>
  useQuery({
    queryKey: licenseKeys.renewals(id ?? ''),
    queryFn: () => getRenewals(id as string),
    enabled: useIsSignedIn() && !!id,
  });
