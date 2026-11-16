import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn } from '@/features/auth/hooks/useAuth';

import { getForm, getForms, getSubmissions } from './forms.api';
import { formKeys } from './query-keys';

export const useForms = (shopId: string) =>
  useQuery({
    queryKey: formKeys.shop(shopId),
    queryFn: () => getForms(shopId),
    enabled: useIsSignedIn() && !!shopId,
  });

export const useShopForm = (id?: string) =>
  useQuery({
    queryKey: formKeys.detail(id ?? ''),
    queryFn: () => getForm(id as string),
    enabled: useIsSignedIn() && !!id,
  });

export const useFormSubmissions = (id: string | undefined, enabled = true) =>
  useQuery({
    queryKey: formKeys.submissions(id ?? ''),
    queryFn: () => getSubmissions(id as string),
    enabled: useIsSignedIn() && !!id && enabled,
  });
