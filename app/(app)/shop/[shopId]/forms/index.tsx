import { useRouter } from 'expo-router';
import React from 'react';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { useForms } from '@/features/forms/api/forms.queries';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';

export default function FormsScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const forms = useForms(shopId);
  const list = (forms.data ?? []).filter((f) => manages || f.isActive);

  return (
    <FormScreen
      title='Forms'
      footer={
        manages ? (
          <AppButton
            iconLeft='Plus'
            fullWidth
            onPress={() =>
              router.push({
                pathname: '/shop/[shopId]/forms/new',
                params: { shopId },
              })
            }>
            New form
          </AppButton>
        ) : undefined
      }>
      {forms.isLoading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : list.length === 0 ? (
        <EmptyState
          icon='ClipboardList'
          title='No forms yet'
          body={
            manages
              ? 'Build checklists like opening checks or fridge temperatures.'
              : 'Your manager has not shared any forms.'
          }
        />
      ) : (
        <ListSection>
          {list.map((f) => (
            <ListItem
              key={f.id}
              icon='ClipboardList'
              iconTone={f.isActive ? 'neutral' : 'warning'}
              title={f.title}
              subtitle={[
                f.description,
                `${f.schema.length} questions`,
                f.isActive ? null : 'Hidden',
              ]
                .filter(Boolean)
                .join(' · ')}
              onPress={() =>
                router.push({
                  pathname: '/shop/[shopId]/forms/[formId]',
                  params: { shopId, formId: f.id },
                })
              }
            />
          ))}
        </ListSection>
      )}
    </FormScreen>
  );
}
