import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormField } from '@/features/auth/components';
import { spacing } from '@/theme/Common';

type RenewalShape = {
  issueDate: string;
  expiryDate: string;
  paymentAmount: string;
  paymentDate: string;
  notes: string;
};

/** Issue/expiry dates, optional fee and notes: shared by add and renew. */
export function RenewalFields<T extends FieldValues & RenewalShape>({
  control,
}: {
  control: Control<T>;
}) {
  const f = (n: keyof RenewalShape) => n as unknown as Path<T>;
  return (
    <>
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormField
            control={control}
            name={f('issueDate')}
            label='Issued'
            placeholder='YYYY-MM-DD'
            keyboardType='numbers-and-punctuation'
          />
        </View>
        <View style={styles.flex}>
          <FormField
            control={control}
            name={f('expiryDate')}
            label='Expires'
            placeholder='YYYY-MM-DD'
            keyboardType='numbers-and-punctuation'
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <FormField
            control={control}
            name={f('paymentAmount')}
            label='Fee paid (optional)'
            placeholder='0.00'
            keyboardType='decimal-pad'
          />
        </View>
        <View style={styles.flex}>
          <FormField
            control={control}
            name={f('paymentDate')}
            label='Paid on'
            placeholder='YYYY-MM-DD'
            keyboardType='numbers-and-punctuation'
          />
        </View>
      </View>
      <FormField
        control={control}
        name={f('notes')}
        label='Notes (optional)'
        multiline
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[3] },
  flex: { flex: 1 },
});

/** Form strings -> API body (cents, undefined for blanks). */
export function toRenewalInput(
  v: RenewalShape,
  parseCents: (s: string) => number | null,
) {
  return {
    issueDate: v.issueDate,
    expiryDate: v.expiryDate,
    paymentAmount: v.paymentAmount
      ? (parseCents(v.paymentAmount) ?? undefined)
      : undefined,
    paymentDate: v.paymentDate || undefined,
    notes: v.notes.trim() || undefined,
  };
}
