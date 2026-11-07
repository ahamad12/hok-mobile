import { z } from 'zod';

// Mirrors createShopBodySchema / shopAddressSchema in tapt-api shop.contract.ts.

export const shopBasicsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Shop name is too short')
    .max(100, 'Shop name is too long'),
  phone: z
    .string()
    .trim()
    .min(5, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
});

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} is too long`).optional();

export const shopAddressFormSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, 'Street is required')
    .max(200, 'Street is too long'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City is too long'),
  region: optionalText(100, 'Region'),
  postalCode: optionalText(20, 'Postal code'),
  country: optionalText(100, 'Country'),
});

export const shopFormSchema = shopBasicsSchema.extend({
  address: shopAddressFormSchema,
});

export type ShopFormValues = z.infer<typeof shopFormSchema>;

/** Drops empty optional address parts so the API never stores "". */
export function toShopInput(values: ShopFormValues) {
  const { region, postalCode, country, ...address } = values.address;
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    address: {
      ...address,
      ...(region ? { region } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(country ? { country } : {}),
    },
  };
}

export const emptyShopForm: ShopFormValues = {
  name: '',
  phone: '',
  address: { street: '', city: '', region: '', postalCode: '', country: '' },
};
