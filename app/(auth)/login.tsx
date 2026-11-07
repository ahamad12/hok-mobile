import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { useColors } from '@/contexts/ColorContext';
import { useLogin } from '@/features/auth/api/auth.mutations';
import {
  AuthScreen,
  FormField,
  useServerErrors,
} from '@/features/auth/components';
import {
  LoginFormValues,
  loginSchema,
} from '@/features/auth/schemas/auth.schemas';
import { spacing } from '@/theme/Common';

// Navigation is driven by the (auth) layout guard once status is signedIn.
export default function LoginScreen() {
  const login = useLogin();
  const { colors } = useColors();
  const { control, handleSubmit, setError } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'email',
    'password',
  ]);

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    login.mutate(values, { onError });
  };

  return (
    <AuthScreen
      title='Sign in'
      subtitle="Your shop's books, open where you left them."
      error={formError}
      footer={
        <>
          <AppView row justify='center' gap={1}>
            <AppText color='secondary'>New business?</AppText>
            <Link href='/(auth)/register'>
              <AppText color='link' weight='semibold'>
                Create an owner account
              </AppText>
            </Link>
          </AppView>
          <View
            style={[
              styles.note,
              { borderTopColor: colors.border.active },
            ]}>
            <AppIcon name='MailOpen' size={18} color={colors.icon.primary} />
            <AppText variant='caption' color='secondary' style={styles.flex}>
              Managers and staff join through the invitation email from their
              business. Open the link in that email to set up your account.
            </AppText>
          </View>
        </>
      }>
      <FormField
        control={control}
        name='email'
        label='Email'
        iconLeft='Mail'
        placeholder='you@business.com'
        autoCapitalize='none'
        autoCorrect={false}
        autoComplete='email'
        keyboardType='email-address'
        textContentType='emailAddress'
        editable={!login.isPending}
      />
      <FormField
        control={control}
        name='password'
        label='Password'
        iconLeft='LockKeyhole'
        secureTextEntry
        showPasswordToggle
        autoComplete='password'
        textContentType='password'
        editable={!login.isPending}
        onSubmitEditing={handleSubmit(onSubmit)}
        returnKeyType='go'
      />
      <AppButton
        variant='brand'
        onPress={handleSubmit(onSubmit)}
        loading={login.isPending}
        disabled={login.isPending}
        size='lg'
        fullWidth>
        Sign in
      </AppButton>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  note: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingTop: spacing[5],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
