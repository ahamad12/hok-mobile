import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
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

// Navigation is driven by the (auth) layout guard once status is signedIn.
export default function LoginScreen() {
  const login = useLogin();
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
      title='Welcome back'
      subtitle='Sign in to your TAPT account'
      error={formError}>
      <FormField
        control={control}
        name='email'
        label='Email'
        autoCapitalize='none'
        autoCorrect={false}
        keyboardType='email-address'
        textContentType='emailAddress'
        editable={!login.isPending}
      />
      <FormField
        control={control}
        name='password'
        label='Password'
        secureTextEntry
        showPasswordToggle
        textContentType='password'
        editable={!login.isPending}
      />
      <AppButton
        onPress={handleSubmit(onSubmit)}
        loading={login.isPending}
        disabled={login.isPending}
        fullWidth>
        Sign in
      </AppButton>
      <AppView row justify='center' gap={1}>
        <AppText color='secondary'>New business?</AppText>
        <Link href='/(auth)/register'>
          <AppText color='link'>Create an account</AppText>
        </Link>
      </AppView>
      <AppText color='secondary' align='center' variant='caption'>
        Managers and staff join through the invitation email from their
        business.
      </AppText>
    </AuthScreen>
  );
}
