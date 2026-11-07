import { useMutation, useQueryClient } from '@tanstack/react-query';

import { teamKeys } from '@/features/team/api/query-keys';

import { shopKeys } from './query-keys';
import {
  createShop,
  deleteShop,
  removeShopStaff,
  updateShop,
} from './shops.api';
import { CreateShopInput, Shop, UpdateShopInput } from './shops.types';

export const useCreateShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShopInput) => createShop(input),
    // The wizard renders field errors inline.
    meta: { silent: true },
    onSuccess: (shop) => {
      qc.setQueryData(shopKeys.detail(shop.id), shop);
      return qc.invalidateQueries({ queryKey: shopKeys.mine() });
    },
  });
};

export const useUpdateShop = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateShopInput) => updateShop(id, input),
    onSuccess: (shop: Shop) => {
      qc.setQueryData(shopKeys.detail(id), shop);
      qc.setQueryData<Shop[]>(shopKeys.mine(), (prev) =>
        prev?.map((s) => (s.id === id ? shop : s)),
      );
    },
  });
};

export const useDeleteShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShop(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Shop[]>(shopKeys.mine(), (prev) =>
        prev?.filter((s) => s.id !== id),
      );
      qc.removeQueries({ queryKey: shopKeys.detail(id) });
      qc.removeQueries({ queryKey: shopKeys.staff(id) });
    },
  });
};

export const useRemoveShopStaff = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeShopStaff(shopId, userId),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: shopKeys.staff(shopId) }),
        qc.invalidateQueries({ queryKey: teamKeys.members() }),
      ]),
  });
};
