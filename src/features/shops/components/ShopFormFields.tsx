import React from 'react';
import { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormField } from '@/features/auth/components';
import { spacing } from '@/theme/Common';

import { ShopFormValues } from '../schemas/shop.schemas';

type Props = { control: Control<ShopFormValues>; disabled?: boolean };

export const SHOP_SERVER_FIELDS = [
  'name',
  'phone',
  'address.street',
  'address.city',
  'address.region',
  'address.postalCode',
  'address.country',
] as const;

export function ShopBasicsFields({ control, disabled }: Props) {
  return (
    <View style={styles.stack}>
      <FormField
        control={control}
        name='name'
        label='Shop name'
        iconLeft='Store'
        placeholder='e.g. Main Street Store'
        autoCapitalize='words'
        editable={!disabled}
        required
      />
      <FormField
        control={control}
        name='phone'
        label='Phone'
        iconLeft='Phone'
        placeholder='+94 77 123 4567'
        keyboardType='phone-pad'
        textContentType='telephoneNumber'
        autoComplete='tel'
        editable={!disabled}
        required
      />
    </View>
  );
}

export function ShopAddressFields({ control, disabled }: Props) {
  return (
    <View style={styles.stack}>
      <FormField
        control={control}
        name='address.street'
        label='Street address'
        iconLeft='MapPin'
        textContentType='fullStreetAddress'
        autoComplete='street-address'
        editable={!disabled}
        required
      />
      <FormField
        control={control}
        name='address.city'
        label='City'
        textContentType='addressCity'
        editable={!disabled}
        required
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormField
            control={control}
            name='address.region'
            label='Region'
            textContentType='addressState'
            editable={!disabled}
          />
        </View>
        <View style={styles.flex}>
          <FormField
            control={control}
            name='address.postalCode'
            label='Postal code'
            textContentType='postalCode'
            keyboardType='number-pad'
            editable={!disabled}
          />
        </View>
      </View>
      <FormField
        control={control}
        name='address.country'
        label='Country'
        textContentType='countryName'
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing[4] },
  row: { flexDirection: 'row', gap: spacing[3] },
  flex: { flex: 1 },
});
