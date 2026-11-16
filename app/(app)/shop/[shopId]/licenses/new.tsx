import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useCreateLicense } from '@/features/licenses/api/licenses.mutations';
import {
  RenewalFields,
  toRenewalInput,
} from '@/features/licenses/components/RenewalFields';
import {
  LicenseFormValues,
  licenseSchema,
} from '@/features/licenses/schemas/licenses.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { addDays, today } from '@/utils/businessDate';
import { parseMoneyToCents } from '@/utils/money';

function NewLicenseScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const toast = useToast();
  const create = useCreateLicense(shopId);

  const { control, handleSubmit, setError } = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      productName: '',
      licenseNumber: '',
      remindDays: '30',
      issueDate: today(),
      expiryDate: addDays(today(), 365),
      paymentAmount: '',
      paymentDate: '',
      notes: '',
    },
    mode: 'onTouched',
  });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'productName',
    'licenseNumber',
    'remindDays',
    'issueDate',
    'expiryDate',
    'paymentAmount',
    'paymentDate',
    'notes',
  ]);

  const submit = handleSubmit((v) => {
    setFormError(null);
    create.mutate(
      {
        productName: v.productName.trim(),
        licenseNumber: v.licenseNumber.trim(),
        remindDays: v.remindDays ? Number(v.remindDays) : undefined,
        ...toRenewalInput(v, parseMoneyToCents),
      },
      {
        onSuccess: (l) => {
          toast.success(`${l.productName} licence added`);
          router.back();
        },
        onError,
      },
    );
  });

  return (
    <FormScreen
      title='Add licence'
      dismiss='close'
      error={formError}
      footer={
        <AppButton onPress={submit} loading={create.isPending} fullWidth>
          Add licence
        </AppButton>
      }>
      <FormField
        control={control}
        name='productName'
        label='Licence for'
        placeholder='e.g. Lottery retailer'
      />
      <FormField
        control={control}
        name='licenseNumber'
        label='Licence number'
        autoCapitalize='characters'
      />
      <RenewalFields control={control} />
      <FormField
        control={control}
        name='remindDays'
        label='Remind me (days before expiry)'
        keyboardType='number-pad'
        helperText='It shows on Home once inside this window'
      />
    </FormScreen>
  );
}

export default withPageAccess('licenses', 'New licence', NewLicenseScreen);
