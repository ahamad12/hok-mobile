import { PackFilters } from './scratch.types';

export const scratchKeys = {
  all: ['scratch'] as const,
  shop: (shopId: string) => [...scratchKeys.all, shopId] as const,
  games: (shopId: string) => [...scratchKeys.shop(shopId), 'games'] as const,
  packs: (shopId: string, filters: PackFilters = {}) =>
    [...scratchKeys.shop(shopId), 'packs', filters] as const,
  pack: (id: string) => [...scratchKeys.all, 'pack', id] as const,
  scans: (shopId: string, date: string) =>
    [...scratchKeys.shop(shopId), 'scans', date] as const,
  summary: (shopId: string, from: string, to: string) =>
    [...scratchKeys.shop(shopId), 'summary', from, to] as const,
};
