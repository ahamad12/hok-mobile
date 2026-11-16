import { ENDPOINTS } from '@/constants/Endpoints';
import { apiGet, apiPatch, apiPost } from '@/services/apiRequest';

import {
  CreateScratchGameInput,
  PackFilters,
  ReceivePackInput,
  RecordScanInput,
  ScratchGame,
  ScratchPack,
  ScratchPackLocation,
  ScratchScan,
  ScratchSummary,
} from './scratch.types';

const S = ENDPOINTS.SCRATCH;

export async function getGames(shopId: string): Promise<ScratchGame[]> {
  return (await apiGet<{ games: ScratchGame[] }>(S.LIST_GAMES, { shopId }))
    .games;
}

/** OWNER/MANAGER. */
export const createGame = (input: CreateScratchGameInput) =>
  apiPost<ScratchGame>(S.CREATE_GAME, input);

export const getPacks = (shopId: string, filters: PackFilters = {}) =>
  apiGet<{ packs: ScratchPack[]; total: number }>(S.LIST_PACKS, {
    shopId,
    limit: 100,
    ...filters,
  });

export const getPack = (id: string) => apiGet<ScratchPack>(S.GET_PACK(id));

export const receivePack = (input: ReceivePackInput) =>
  apiPost<ScratchPack>(S.CREATE_PACK, input);

export const movePack = (id: string, location: ScratchPackLocation) =>
  apiPatch<ScratchPack>(S.UPDATE_LOCATION(id), { location });

/** OWNER/MANAGER. */
export const returnPack = (id: string) =>
  apiPost<ScratchPack>(S.RETURN_PACK(id));

export const recordScan = (packId: string, input: RecordScanInput) =>
  apiPost<ScratchScan>(S.SCAN(packId), input);

/** One shop's scans for one business day, voided ones included. */
export async function getScans(
  shopId: string,
  date: string,
): Promise<ScratchScan[]> {
  return (
    await apiGet<{ scans: ScratchScan[] }>(S.LIST_SCANS, { shopId, date })
  ).scans;
}

/** OWNER/MANAGER; only a pack's latest scan can be voided. */
export const voidScan = (id: string, voidReason: string) =>
  apiPost<ScratchScan>(S.VOID_SCAN(id), { voidReason });

export const getSummary = (shopId: string, dateFrom: string, dateTo: string) =>
  apiGet<ScratchSummary>(S.SUMMARY, { shopId, dateFrom, dateTo });
