import {
  emptyShopForm,
  shopFormSchema,
  toShopInput,
} from '@/features/shops/schemas/shop.schemas';

const valid = {
  name: 'Main Street',
  phone: '0771234567',
  address: {
    street: '1 Main St',
    city: 'Colombo',
    region: '',
    postalCode: '',
    country: '',
  },
};

describe('shopFormSchema', () => {
  it('accepts a valid shop with empty optional address parts', () => {
    expect(shopFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects the empty form with errors on the required fields', () => {
    const r = shopFormSchema.safeParse(emptyShopForm);
    expect(r.success).toBe(false);
    const paths = r.error?.issues.map((i) => i.path.join('.')) ?? [];
    expect(paths).toEqual(
      expect.arrayContaining([
        'name',
        'phone',
        'address.street',
        'address.city',
      ]),
    );
  });

  it('enforces the contract lengths', () => {
    expect(shopFormSchema.safeParse({ ...valid, name: 'A' }).success).toBe(
      false,
    );
    expect(shopFormSchema.safeParse({ ...valid, phone: '1234' }).success).toBe(
      false,
    );
    expect(
      shopFormSchema.safeParse({ ...valid, phone: '1'.repeat(21) }).success,
    ).toBe(false);
  });
});

describe('toShopInput', () => {
  it('trims and drops empty optional address parts', () => {
    expect(
      toShopInput({
        ...valid,
        name: '  Main Street ',
        address: { ...valid.address, region: 'Western' },
      }),
    ).toEqual({
      name: 'Main Street',
      phone: '0771234567',
      address: { street: '1 Main St', city: 'Colombo', region: 'Western' },
    });
  });
});
