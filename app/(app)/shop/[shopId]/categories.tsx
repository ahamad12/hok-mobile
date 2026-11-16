import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useSaveCategory } from '@/features/deliveries/api/deliveries.mutations';
import {
  useCategories,
  useSuppliers,
} from '@/features/deliveries/api/deliveries.queries';
import { Category } from '@/features/deliveries/api/deliveries.types';
import {
  CategoryFormValues,
  categorySchema,
} from '@/features/deliveries/schemas/deliveries.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

const EMPTY: CategoryFormValues = { name: '', description: '' };

/** Supplier categories (OWNER/MANAGER edit; everyone can read). */
function CategoriesScreen() {
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const categories = useCategories(shopId);
  const suppliers = useSuppliers(shopId);
  const sheet = useRef<AppBottomSheetRef>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const save = useSaveCategory(shopId, editing?.id);

  const { control, handleSubmit, setError, reset } =
    useForm<CategoryFormValues>({
      resolver: zodResolver(categorySchema),
      defaultValues: EMPTY,
      mode: 'onTouched',
    });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'name',
    'description',
  ]);

  const count = (id: string) =>
    (suppliers.data ?? []).filter((s) => s.categoryId === id).length;

  const open = (c: Category | null) => {
    setEditing(c);
    setFormError(null);
    reset(c ? { name: c.name, description: c.description ?? '' } : EMPTY);
    sheet.current?.open();
  };

  const submit = handleSubmit((v) => {
    save.mutate(
      { name: v.name.trim(), description: v.description.trim() || null },
      {
        onSuccess: () => {
          toast.success(editing ? 'Category saved' : 'Category added');
          sheet.current?.close();
        },
        onError,
      },
    );
  });

  const toggleActive = () => {
    if (!editing) return;
    save.mutate(
      { name: editing.name, isActive: !editing.isActive },
      { onSuccess: () => sheet.current?.close() },
    );
  };

  return (
    <FormScreen
      title='Categories'
      footer={
        manages ? (
          <AppButton onPress={() => open(null)} iconLeft='Plus' fullWidth>
            Add category
          </AppButton>
        ) : undefined
      }>
      {categories.isLoading ? (
        <ListSection>
          <SkeletonRow />
        </ListSection>
      ) : (categories.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon='Tags'
          title='No categories yet'
          body='e.g. Dairy, Beverages, Tobacco'
        />
      ) : (
        <ListSection>
          {categories.data?.map((c) => (
            <ListItem
              key={c.id}
              icon='Tag'
              iconTone={c.isActive ? 'neutral' : 'warning'}
              title={c.name}
              subtitle={[
                c.description,
                `${count(c.id)} suppliers`,
                c.isActive ? null : 'Hidden',
              ]
                .filter(Boolean)
                .join(' · ')}
              onPress={manages ? () => open(c) : undefined}
            />
          ))}
        </ListSection>
      )}

      <AppBottomSheet
        ref={sheet}
        title={editing ? 'Edit category' : 'Add category'}>
        <View style={styles.sheet}>
          {formError ? (
            <AppText variant='bodySmall' color='error'>
              {formError}
            </AppText>
          ) : null}
          <FormField control={control} name='name' label='Name' />
          <FormField
            control={control}
            name='description'
            label='Description (optional)'
          />
          <AppButton onPress={submit} loading={save.isPending} fullWidth>
            {editing ? 'Save' : 'Add category'}
          </AppButton>
          {editing ? (
            <AppButton
              variant='ghost'
              onPress={toggleActive}
              disabled={save.isPending}>
              {editing.isActive ? 'Hide this category' : 'Make active again'}
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

export default withPageAccess('categories', 'Categories', CategoriesScreen);
