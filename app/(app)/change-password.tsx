import { zodResolver } from '@hookform/resolvers/zod';
import React, { useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { useColors } from '@/contexts/ColorContext';
import { useChangePassword } from '@/features/auth/api/auth.mutations';
import {
  FormField,
  PasswordChecklist,
  useServerErrors,
} from '@/features/auth/components';
import {
  ChangePasswordFormValues,
  changePasswordSchema,
} from '@/features/auth/schemas/auth.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { borderRadius, spacing } from '@/theme/Common';

export default function ChangePasswordScreen() {
  const { colors } = useColors();
  const changePassword = useChangePassword();
  const confirm = useRef<ConfirmSheetRef>(null);

  const { control, handleSubmit, setError } = useForm<ChangePasswordFormValues>(
    {
      resolver: zodResolver(changePasswordSchema),
      defaultValues: { currentPassword: '', newPassword: '' },
      mode: 'onTouched',
    },
  );
  const newPassword = useWatch({ control, name: 'newPassword' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'currentPassword',
    'newPassword',
  ]);

  // Success revokes every session including this one; the app guard then
  // sends the user to sign in. Confirm first.
  const submit = handleSubmit((values) => {
    setFormError(null);
    confirm.current?.ask({
      title: 'Change password?',
      message: "You'll be signed out on all devices, including this one.",
      confirmLabel: 'Change password',
      icon: 'KeyRound',
      onConfirm: () =>
        changePassword.mutateAsync(values).catch((e) => {
          onError(e);
        }),
    });
  });

  return (
    <FormScreen
      title='Change password'
      error={formError}
      footer={
        <AppButton
          onPress={submit}
          loading={changePassword.isPending}
          fullWidth>
          Update password
        </AppButton>
      }>
      <View
        style={[
          styles.note,
          { backgroundColor: colors.background.warningSubtle },
        ]}>
        <AppIcon name='TriangleAlert' size={18} color={colors.icon.warning} />
        <AppText variant='bodySmall' color='warning' style={styles.flex}>
          Changing your password signs you out everywhere. You'll sign in again
          with the new one.
        </AppText>
      </View>
      <FormField
        control={control}
        name='currentPassword'
        label='Current password'
        iconLeft='LockKeyhole'
        secureTextEntry
        showPasswordToggle
        autoComplete='current-password'
        textContentType='password'
        editable={!changePassword.isPending}
      />
      <FormField
        control={control}
        name='newPassword'
        label='New password'
        iconLeft='KeyRound'
        secureTextEntry
        showPasswordToggle
        autoComplete='new-password'
        textContentType='newPassword'
        editable={!changePassword.isPending}
      />
      <PasswordChecklist password={newPassword ?? ''} />
      <ConfirmSheet ref={confirm} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  note: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: borderRadius.md,
  },
});
