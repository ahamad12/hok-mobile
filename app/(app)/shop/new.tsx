import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Path, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { PageTitle } from '@/components/PageTitle';
import { RuneTally } from '@/components/RuneTally';
import { useServerErrors } from '@/features/auth/components';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useCreateShop } from '@/features/shops/api/shops.mutations';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { ShopCard } from '@/features/shops/components/ShopCard';
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
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

const STEPS = [
  {
    label: 'Name your hok',
    hint: 'What your team calls this shop, and the number to reach it.',
  },
  {
    label: 'Where it stands',
    hint: 'The address your staff and suppliers know it by.',
  },
  {
    label: 'Carve it in',
    hint: 'This is how your hok will look. Check it, then open it.',
  },
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

/** Required fields still empty on a step, for the "what's left" line. */
function fieldsLeft(
  step: number,
  v: {
    name?: string;
    phone?: string;
    address?: Partial<ShopFormValues['address']>;
  },
): number {
  const filled = (s: string | undefined, min: number) =>
    (s ?? '').trim().length >= min;
  if (step === 0) {
    return [filled(v.name, 2), filled(v.phone, 5)].filter((ok) => !ok).length;
  }
  if (step === 1) {
    return [filled(v.address?.street, 1), filled(v.address?.city, 1)].filter(
      (ok) => !ok,
    ).length;
  }
  return 0;
}

/** Three-step "open a hok" wizard (owner only). */
export default function NewShopScreen() {
  const router = useRouter();
  const user = useUser();
  const toast = useToast();
  const create = useCreateShop();
  const [step, setStep] = useState(0);

  const { control, handleSubmit, setError, trigger } = useForm<ShopFormValues>({
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
          toast.success(`${shop.name} is open`, 'Hok carved');
          router.replace({
            pathname: '/shop/[shopId]',
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

  // eslint-disable-next-line security/detect-object-injection
  const current = STEPS[step];
  const left = fieldsLeft(step, values);
  const last = step === STEPS.length - 1;
  const preview = {
    name: values.name ?? '',
    phone: values.phone ?? '',
    logoUrl: null,
    address: {
      street: values.address?.street ?? '',
      city: values.address?.city ?? '',
      region: values.address?.region,
    },
  };

  return (
    <FormScreen
      title='Open a hok'
      dismiss='close'
      showTitle={false}
      headerRight={<RuneTally step={step + 1} total={STEPS.length} />}
      error={formError}
      footer={
        <View style={styles.footer}>
          {!last ? (
            <View style={styles.status}>
              {left === 0 ? <View style={styles.readyMark} /> : null}
              <AppText variant='bodySmall' color='secondary'>
                {left === 0
                  ? 'Ready'
                  : `${left} ${left === 1 ? 'field' : 'fields'} left`}
              </AppText>
            </View>
          ) : null}
          <View style={styles.actions}>
            {step > 0 ? (
              <AppButton
                variant='tertiary'
                size='lg'
                onPress={() => setStep((s) => s - 1)}
                iconLeft='ArrowLeft'
                rounded='none'
                disabled={create.isPending}
                accessibilityLabel='Back'
              />
            ) : null}
            <AppButton
              variant='brand'
              size='lg'
              onPress={last ? submit : next}
              loading={create.isPending}
              style={styles.flex}>
              {last ? 'Open hok' : 'Continue'}
            </AppButton>
          </View>
        </View>
      }>
      <Animated.View
        key={step}
        entering={FadeInDown.duration(260)}
        style={styles.step}>
        <PageTitle title={current.label} subtitle={current.hint} size='form' />

        {step === 0 ? <ShopBasicsFields control={control} /> : null}
        {step === 1 ? <ShopAddressFields control={control} /> : null}
        {last ? (
          <View style={styles.review}>
            <ShopCard shop={preview} />
            <SummaryRow
              label='Name and phone'
              value={[values.name, values.phone].filter(Boolean).join('  ·  ')}
              onEdit={() => setStep(0)}
            />
            <SummaryRow
              label='Address'
              value={formatShopAddress(preview.address) || '—'}
              onEdit={() => setStep(1)}
            />
          </View>
        ) : null}
      </Animated.View>
    </FormScreen>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.summary}>
      <View style={styles.flex}>
        <AppText variant='bodySmall' color='tertiary'>
          {label}
        </AppText>
        <AppText variant='body'>{value}</AppText>
      </View>
      <Pressable
        onPress={onEdit}
        hitSlop={12}
        accessibilityRole='button'
        accessibilityLabel={`Edit ${label.toLowerCase()}`}>
        <AppText variant='body' weight='semibold' color='link'>
          Edit
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  step: { gap: spacing[8] },
  review: { gap: spacing[5] },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  footer: { flex: 1, gap: spacing[3] },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  readyMark: {
    width: 14,
    height: 4,
    backgroundColor: palette.hok.rust,
    transform: [{ rotate: '-30deg' }],
  },
  actions: { flexDirection: 'row', gap: spacing[3] },
});
