import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { useServerErrors } from '@/features/auth/components';
import { useUpdateShop } from '@/features/shops/api/shops.mutations';
import { useShop } from '@/features/shops/api/shops.queries';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';
import { ShopCover } from '@/features/shops/components/ShopCover';
import {
  SHOP_SERVER_FIELDS,
  ShopAddressFields,
  ShopBasicsFields,
} from '@/features/shops/components/ShopFormFields';
import {
  emptyShopForm,
  shopFormSchema,
  ShopFormValues,
  toShopInput,
} from '@/features/shops/schemas/shop.schemas';
import { useToast } from '@/hooks/useToast';

function EditShopScreen() {
  const { shopId: id } = useLocalSearchParams<{ shopId: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: shop, isLoading } = useShop(id);
  const update = useUpdateShop(id);

  const { control, handleSubmit, setError, reset, formState } =
    useForm<ShopFormValues>({
      resolver: zodResolver(shopFormSchema),
      defaultValues: emptyShopForm,
      mode: 'onTouched',
    });
  // The cover's initials follow the name as you type.
  const watchedName = useWatch({ control, name: 'name' });
  const { formError, setFormError, onError } = useServerErrors(
    setError,
    SHOP_SERVER_FIELDS,
  );

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        phone: shop.phone,
        address: {
          street: shop.address.street,
          city: shop.address.city,
          region: shop.address.region ?? '',
          postalCode: shop.address.postalCode ?? '',
          country: shop.address.country ?? '',
        },
      });
    }
  }, [shop, reset]);

  const save = handleSubmit((v) => {
    setFormError(null);
    update.mutate(toShopInput(v), {
      onSuccess: () => {
        toast.success('Shop details saved');
        router.back();
      },
      onError,
    });
  });

  return (
    <FormScreen
      title='Edit hok'
      error={formError}
      footer={
        <AppButton
          variant='brand'
          size='lg'
          onPress={save}
          loading={update.isPending}
          disabled={!formState.isDirty || update.isPending}
          fullWidth>
          Save changes
        </AppButton>
      }>
      {isLoading || !shop ? (
        <AppActivityIndicator />
      ) : (
        <>
          <ShopCover
            shop={{
              id: shop.id,
              name: watchedName || shop.name,
              logoUrl: shop.logoUrl,
            }}
            aspectRatio={16 / 9}
          />
          <AppText variant='h6'>Name and phone</AppText>
          <ShopBasicsFields control={control} disabled={update.isPending} />
          <AppText variant='h6'>Address</AppText>
          <ShopAddressFields control={control} disabled={update.isPending} />
        </>
      )}
    </FormScreen>
  );
}

export default withPageAccess('edit', 'Edit shop', EditShopScreen);
