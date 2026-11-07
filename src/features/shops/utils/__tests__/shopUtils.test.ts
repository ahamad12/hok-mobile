import { Shop } from '@/features/shops/api/shops.types';
import {
  filterShops,
  formatShopAddress,
  formatShopLocation,
  sortShopsByName,
} from '@/features/shops/utils/shopUtils';

const shop = (over: Partial<Shop>): Shop => ({
  id: 's1',
  name: 'Main Street',
  address: { street: '1 Main St', city: 'Colombo', region: 'Western' },
  phone: '0771234567',
  logoUrl: null,
  ownerId: 'o1',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...over,
});

describe('formatShopLocation / formatShopAddress', () => {
  it('joins the non-empty parts', () => {
    expect(formatShopLocation({ street: 'x', city: 'Kandy', region: '' })).toBe(
      'Kandy',
    );
    expect(
      formatShopAddress({
        street: '1 Main St',
        city: 'Colombo',
        postalCode: '00100',
      }),
    ).toBe('1 Main St, Colombo, 00100');
    expect(formatShopLocation(undefined)).toBe('');
  });
});

describe('filterShops', () => {
  const shops = [
    shop({ id: 'a', name: 'Main Street' }),
    shop({
      id: 'b',
      name: 'Harbour',
      address: { street: '9 Dock Rd', city: 'Galle' },
      isActive: false,
    }),
  ];

  it('returns everything for an empty query', () => {
    expect(filterShops(shops, '  ')).toHaveLength(2);
  });

  it('matches name, city and phone case-insensitively', () => {
    expect(filterShops(shops, 'harb').map((s) => s.id)).toEqual(['b']);
    expect(filterShops(shops, 'GALLE').map((s) => s.id)).toEqual(['b']);
    expect(filterShops(shops, '0771').map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('sorts by name without mutating the input', () => {
    const input = [
      shop({ id: 'z', name: 'Zeta' }),
      shop({ id: 'a', name: 'Alpha' }),
    ];
    expect(sortShopsByName(input).map((s) => s.id)).toEqual(['a', 'z']);
    expect(input[0].id).toBe('z');
  });
});
