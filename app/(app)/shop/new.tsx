import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Path, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { ListItem, ListSection } from '@/components/ListItem';
import { WizardStepIndicator } from '@/components/WizardStepIndicator';
import { useServerErrors } from '@/features/auth/components';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useCreateShop } from '@/features/shops/api/shops.mutations';
import { FormScreen } from '@/features/shops/components/FormScreen';
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
import { formatShopAddress } from '@/features/shops/utils/shopUtils';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

const STEPS = [
  { label: 'The basics', hint: 'What should your team call this shop?' },
  { label: 'Where is it?', hint: 'Used on receipts and for your staff.' },
  { label: 'Review', hint: 'Check the details, then create the shop.' },
] as const;

const STEP_FIELDS: Path<ShopFormValues>[][] = [
  ['name', 'phone'],
  [
    'address.street',
    'address.city',
    'address.region',
    'address.postalCode',
    'address.country',
  ],
  [],
];

/** Three-step "add a shop" wizard (owner only). */
export default function NewShopScreen() {
  const router = useRouter();
  const user = useUser();
  const toast = useToast();
  const create = useCreateShop();
  const [step, setStep] = useState(0);

  const { control, handleSubmit, setError, trigger, getValues } =
    useForm<ShopFormValues>({
      resolver: zodResolver(shopFormSchema),
      defaultValues: emptyShopForm,
      mode: 'onTouched',
    });
  const values = useWatch({ control });
  const { formError, setFormError, onError } = useServerErrors(
    setError,
    SHOP_SERVER_FIELDS,
  );

  if (user && user.role !== 'OWNER') return <Redirect href='/shops' />;

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = handleSubmit(
    (v) => {
      setFormError(null);
      create.mutate(toShopInput(v), {
        onSuccess: (shop) => {
          toast.success(`${shop.name} is ready`, 'Shop created');
          router.replace({
            pathname: '/shop/[shopId]/home',
            params: { shopId: shop.id },
          });
        },
        onError: (e) => {
          onError(e);
          // Jump back to the first step that now carries an error.
          setStep(0);
        },
      });
    },
    () => setStep(0),
  );

  const current = STEPS[step];
  const address = formatShopAddress(getValues('address'));

  return (
    <FormScreen
      title='Add a shop'
      dismiss='close'
      error={formError}
      footer={
        <>
          {step > 0 ? (
            <AppButton
              variant='tertiary'
              onPress={() => setStep((s) => s - 1)}
              iconLeft='ArrowLeft'
              style={styles.back}
              disabled={create.isPending}>
              Back
            </AppButton>
          ) : null}
          {step < STEPS.length - 1 ? (
            <AppButton
              onPress={next}
              iconRight='ArrowRight'
              style={styles.flex}>
              Continue
            </AppButton>
          ) : (
            <AppButton
              onPress={submit}
              loading={create.isPending}
              iconLeft='Check'
              style={styles.flex}>
              Create shop
            </AppButton>
          )}
        </>
      }>
      <WizardStepIndicator
        step={step + 1}
        total={STEPS.length}
        label={current.label}
        hint={current.hint}
      />

      {step === 0 ? <ShopBasicsFields control={control} /> : null}
      {step === 1 ? <ShopAddressFields control={control} /> : null}
      {step === 2 ? (
        <View style={styles.review}>
          <ListSection
            title='Shop'
            action={
              <AppButton variant='ghost' size='sm' onPress={() => setStep(0)}>
                Edit
              </AppButton>
            }>
            <ListItem
              icon='Store'
              iconTone='brand'
              title={values.name ?? ''}
              subtitle='Name'
            />
            <ListItem
              icon='Phone'
              title={values.phone ?? ''}
              subtitle='Phone'
            />
          </ListSection>
          <ListSection
            title='Address'
            action={
              <AppButton variant='ghost' size='sm' onPress={() => setStep(1)}>
                Edit
              </AppButton>
            }>
            <ListItem icon='MapPin' title={address || '—'} subtitle='Address' />
          </ListSection>
        </View>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { paddingHorizontal: spacing[5] },
  review: { gap: spacing[5] },
});
