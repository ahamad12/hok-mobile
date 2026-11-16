import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scratchKeys } from './query-keys';
import {
  createGame,
  movePack,
  receivePack,
  recordScan,
  returnPack,
  voidScan,
} from './scratch.api';
import {
  CreateScratchGameInput,
  ReceivePackInput,
  RecordScanInput,
  ScratchPack,
  ScratchPackLocation,
} from './scratch.types';

/** Packs, scans and totals all move together, so refresh the whole shop. */
const useInvalidateShop = (shopId: string) => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: scratchKeys.shop(shopId) });
};

export const useCreateGame = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateScratchGameInput, 'shopId'>) =>
      createGame({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: scratchKeys.games(shopId) }),
  });
};

export const useReceivePack = (shopId: string) => {
  const invalidate = useInvalidateShop(shopId);
  return useMutation({
    mutationFn: (input: Omit<ReceivePackInput, 'shopId'>) =>
      receivePack({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: invalidate,
  });
};

const usePackUpdate = <V>(
  shopId: string,
  fn: (vars: V) => Promise<ScratchPack>,
) => {
  const qc = useQueryClient();
  const invalidate = useInvalidateShop(shopId);
  return useMutation({
    mutationFn: fn,
    onSuccess: (pack) => {
      qc.setQueryData(scratchKeys.pack(pack.id), pack);
      return invalidate();
    },
  });
};

export const useMovePack = (shopId: string, packId: string) =>
  usePackUpdate(shopId, (location: ScratchPackLocation) =>
    movePack(packId, location),
  );

export const useReturnPack = (shopId: string, packId: string) =>
  usePackUpdate(shopId, () => returnPack(packId));

export const useRecordScan = (shopId: string, packId: string) => {
  const qc = useQueryClient();
  const invalidate = useInvalidateShop(shopId);
  return useMutation({
    mutationFn: (input: RecordScanInput) => recordScan(packId, input),
    meta: { silent: true },
    onSuccess: async () => {
      // A scan can finish the pack.
      await qc.invalidateQueries({ queryKey: scratchKeys.pack(packId) });
      return invalidate();
    },
  });
};

export const useVoidScan = (shopId: string) => {
  const qc = useQueryClient();
  const invalidate = useInvalidateShop(shopId);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      voidScan(id, reason),
    onSuccess: async (scan) => {
      await qc.invalidateQueries({ queryKey: scratchKeys.pack(scan.packId) });
      return invalidate();
    },
  });
};
