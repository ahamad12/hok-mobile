import { Shop, ShopAddress } from '../api/shops.types';

/** "Colombo, Western" — the short line shown on cards. */
export const formatShopLocation = (a?: ShopAddress | null): string =>
  [a?.city, a?.region].filter((p) => !!p && p.trim()).join(', ');

/** Full multi-part address on one line. */
export const formatShopAddress = (a?: ShopAddress | null): string =>
  [a?.street, a?.city, a?.region, a?.postalCode, a?.country]
    .filter((p) => !!p && p.trim())
    .join(', ');

/** A–Z by name (stable copy). */
export const sortShopsByName = (shops: Shop[]): Shop[] =>
  [...shops].sort((a, b) => a.name.localeCompare(b.name));

/** Case-insensitive match on name, street, city, region and phone. */
export function filterShops(shops: Shop[], query: string): Shop[] {
  const q = query.trim().toLowerCase();
  return shops.filter((s) => {
    if (!q) return true;
    return [
      s.name,
      s.phone,
      s.address?.street,
      s.address?.city,
      s.address?.region,
    ]
      .filter(Boolean)
      .some((v) => (v as string).toLowerCase().includes(q));
  });
}
