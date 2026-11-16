import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ListItem, ListSection } from '@/components/ListItem';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useCreateTillEntry } from '@/features/money/api/money.mutations';
import { TillCategory } from '@/features/money/api/money.types';
import {
  TillEntryFormValues,
  tillEntrySchema,
} from '@/features/money/schemas/money.schemas';
import { TILL_CATEGORY } from '@/features/money/utils/moneyUtils';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { formatMoney, parseMoneyToCents } from '@/utils/money';

const ORDER: TillCategory[] = ['SALES', 'EXPENSE', 'DEPOSIT', 'WITHDRAWAL'];

export default function NewTillEntryScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const toast = useToast();
  const create = useCreateTillEntry(shopId);

  const { control, handleSubmit, setError, setValue } =
    useForm<TillEntryFormValues>({
      resolver: zodResolver(tillEntrySchema),
      defaultValues: { category: 'SALES', amount: '', description: '' },
      mode: 'onTouched',
    });
  const category = useWatch({ control, name: 'category' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'category',
    'amount',
    'description',
  ]);

  const submit = handleSubmit((v) => {
    setFormError(null);
    const amount = parseMoneyToCents(v.amount) ?? 0;
    create.mutate(
      {
        category: v.category,
        amount,
        description: v.description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            `${TILL_CATEGORY[v.category].label} · ${formatMoney(amount)}`,
            'Saved',
          );
          router.back();
        },
        onError,
      },
    );
  });

  return (
    <FormScreen
      title='Till entry'
      dismiss='close'
      error={formError}
      footer={
        <AppButton onPress={submit} loading={create.isPending} fullWidth>
          Save entry
        </AppButton>
      }>
      <ListSection title='What happened?'>
        {ORDER.map((c) => {
          const info = TILL_CATEGORY[c];
          const selected = category === c;
          return (
            <ListItem
              key={c}
              icon={info.icon}
              iconTone={selected ? 'brand' : 'neutral'}
              title={info.label}
              subtitle={info.hint}
              chevron={false}
              trailing={
                selected ? (
                  <AppText color='link' weight='semibold'>
                    {info.direction === 'in' ? 'In' : 'Out'}
                  </AppText>
                ) : undefined
              }
              onPress={() => setValue('category', c)}
            />
          );
        })}
      </ListSection>
      <View style={styles.fields}>
        <FormField
          control={control}
          name='amount'
          label='Amount'
          placeholder='0.00'
          keyboardType='decimal-pad'
        />
        <FormField
          control={control}
          name='description'
          label='Note (optional)'
          placeholder={
            category === 'EXPENSE' ? 'e.g. Milk for the staff room' : 'Optional'
          }
        />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({ fields: { gap: spacing[4] } });
