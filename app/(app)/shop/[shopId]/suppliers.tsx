import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Linking, StyleSheet, View } from 'react-native';

import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect } from '@/components/FormSelect';
import { ListItem, ListSection } from '@/components/ListItem';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonRow } from '@/components/Skeleton';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useSaveSupplier } from '@/features/deliveries/api/deliveries.mutations';
import {
  useCategories,
  useSuppliers,
} from '@/features/deliveries/api/deliveries.queries';
import { Supplier } from '@/features/deliveries/api/deliveries.types';
import {
  SupplierFormValues,
  supplierSchema,
} from '@/features/deliveries/schemas/deliveries.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

const EMPTY: SupplierFormValues = {
  name: '',
  categoryId: '',
  phone: '',
  address: '',
};

function SuppliersScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const suppliers = useSuppliers(shopId);
  const categories = useCategories(shopId);
  const sheet = useRef<AppBottomSheetRef>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [query, setQuery] = useState('');
  const save = useSaveSupplier(shopId, editing?.id);

  const { control, handleSubmit, setError, reset } =
    useForm<SupplierFormValues>({
      resolver: zodResolver(supplierSchema),
      defaultValues: EMPTY,
      mode: 'onTouched',
    });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'name',
    'categoryId',
    'phone',
    'address',
  ]);

  const cats = (categories.data ?? []).filter((c) => c.isActive);
  const catName = (id: string) =>
    categories.data?.find((c) => c.id === id)?.name;
  const q = query.trim().toLowerCase();
  const list = (suppliers.data ?? []).filter(
    (s) => !q || s.name.toLowerCase().includes(q),
  );

  const open = (s: Supplier | null) => {
    setEditing(s);
    setFormError(null);
    reset(
      s
        ? {
            name: s.name,
            categoryId: s.categoryId,
            phone: s.phone ?? '',
            address: s.address ?? '',
          }
        : EMPTY,
    );
    sheet.current?.open();
  };

  const submit = handleSubmit((v) => {
    save.mutate(
      {
        name: v.name.trim(),
        categoryId: v.categoryId,
        phone: v.phone.trim() || null,
        address: v.address.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(editing ? 'Supplier saved' : 'Supplier added');
          sheet.current?.close();
        },
        onError,
      },
    );
  });

  const toggleActive = () => {
    if (!editing) return;
    save.mutate(
      {
        name: editing.name,
        categoryId: editing.categoryId,
        isActive: !editing.isActive,
      },
      {
        onSuccess: () => {
          toast.success(
            editing.isActive ? 'Supplier hidden' : 'Supplier active again',
          );
          sheet.current?.close();
        },
      },
    );
  };

  return (
    <FormScreen
      title='Suppliers'
      footer={
        manages ? (
          <AppButton
            onPress={() => open(null)}
            iconLeft='Plus'
            fullWidth
            disabled={cats.length === 0}>
            Add supplier
          </AppButton>
        ) : undefined
      }>
      {manages && !categories.isLoading && cats.length === 0 ? (
        <ListSection footer='Every supplier belongs to a category.'>
          <ListItem
            icon='Tags'
            title='Add a category first'
            onPress={() =>
              router.push({
                pathname: '/shop/[shopId]/categories',
                params: { shopId },
              })
            }
          />
        </ListSection>
      ) : null}
      {(suppliers.data?.length ?? 0) > 5 ? (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder='Search suppliers'
        />
      ) : null}
      {suppliers.isLoading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : list.length === 0 ? (
        <EmptyState
          icon='Factory'
          title={q ? 'No matches' : 'No suppliers yet'}
        />
      ) : (
        <ListSection>
          {list.map((s) => (
            <ListItem
              key={s.id}
              icon='Factory'
              iconTone={s.isActive ? 'neutral' : 'warning'}
              title={s.name}
              subtitle={[
                catName(s.categoryId),
                s.phone,
                s.isActive ? null : 'Hidden',
              ]
                .filter(Boolean)
                .join(' · ')}
              onPress={
                manages
                  ? () => open(s)
                  : s.phone
                    ? () => Linking.openURL(`tel:${s.phone}`)
                    : undefined
              }
            />
          ))}
        </ListSection>
      )}

      <AppBottomSheet
        ref={sheet}
        title={editing ? 'Edit supplier' : 'Add supplier'}>
        <View style={styles.sheet}>
          {formError ? (
            <AppText variant='bodySmall' color='error'>
              {formError}
            </AppText>
          ) : null}
          <FormField control={control} name='name' label='Name' />
          <FormSelect
            control={control}
            name='categoryId'
            label='Category'
            options={cats.map((c) => ({ value: c.id, label: c.name }))}
          />
          <FormField
            control={control}
            name='phone'
            label='Phone (optional)'
            keyboardType='phone-pad'
          />
          <FormField
            control={control}
            name='address'
            label='Address (optional)'
            multiline
          />
          <AppButton onPress={submit} loading={save.isPending} fullWidth>
            {editing ? 'Save' : 'Add supplier'}
          </AppButton>
          {editing ? (
            <AppButton
              variant='ghost'
              onPress={toggleActive}
              disabled={save.isPending}>
              {editing.isActive ? 'Hide this supplier' : 'Make active again'}
            </AppButton>
          ) : null}
        </View>
      </AppBottomSheet>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: spacing[5], gap: spacing[4] },
});

export default withPageAccess('suppliers', 'Suppliers', SuppliersScreen);
