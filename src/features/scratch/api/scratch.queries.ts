import { useQuery } from '@tanstack/react-query';

import { useIsSignedIn } from '@/features/auth/hooks/useAuth';

import { scratchKeys } from './query-keys';
import {
  getGames,
  getPack,
  getPacks,
  getScans,
  getSummary,
} from './scratch.api';
import { PackFilters, ScratchGame } from './scratch.types';

export const useScratchGames = (shopId: string) =>
  useQuery({
    queryKey: scratchKeys.games(shopId),
    queryFn: () => getGames(shopId),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 60 * 10,
  });

/** Games keyed by id, for labelling packs and scans. */
export const useGameLookup = (shopId: string) => {
  const games = useScratchGames(shopId).data ?? [];
  const byId = new Map<string, ScratchGame>(games.map((g) => [g.id, g]));
  return (id: string) => byId.get(id);
};

export const useScratchPacks = (shopId: string, filters: PackFilters = {}) =>
  useQuery({
    queryKey: scratchKeys.packs(shopId, filters),
    queryFn: () => getPacks(shopId, filters),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useScratchPack = (id?: string) =>
  useQuery({
    queryKey: scratchKeys.pack(id ?? ''),
    queryFn: () => getPack(id as string),
    enabled: useIsSignedIn() && !!id,
  });

/** Scan history for one day — tells which shifts are done. */
export const useScratchScans = (shopId: string, date: string) =>
  useQuery({
    queryKey: scratchKeys.scans(shopId, date),
    queryFn: () => getScans(shopId, date),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 30,
  });

export const useScratchSummary = (shopId: string, from: string, to: string) =>
  useQuery({
    queryKey: scratchKeys.summary(shopId, from, to),
    queryFn: () => getSummary(shopId, from, to),
    enabled: useIsSignedIn() && !!shopId,
    staleTime: 1000 * 60,
  });
