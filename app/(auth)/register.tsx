import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { useRegister } from '@/features/auth/api/auth.mutations';
import {
  AuthScreen,
  FormField,
  useServerErrors,
} from '@/features/auth/components';
import {
  RegisterFormValues,
  registerSchema,
} from '@/features/auth/schemas/auth.schemas';

/** Public sign-up creates an OWNER and signs them straight in. */
export default function RegisterScreen() {
  const register = useRegister();
  const { control, handleSubmit, setError } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', displayName: '' },
    mode: 'onTouched',
  });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'email',
    'password',
    'displayName',
    'username',
  ]);

  const onSubmit = ({ username, ...rest }: RegisterFormValues) => {
    setFormError(null);
    register.mutate(
      { ...rest, ...(username ? { username } : {}) },
      { onError },
    );
  };

  return (
    <AuthScreen
      title='Create your business account'
      subtitle='You will be the owner. Invite managers and staff later.'
      error={formError}>
      <FormField
        control={control}
        name='displayName'
        label='Your name'
        editable={!register.isPending}
      />
      <FormField
        control={control}
        name='email'
        label='Email'
        autoCapitalize='none'
        autoCorrect={false}
        keyboardType='email-address'
        textContentType='emailAddress'
        editable={!register.isPending}
      />
      <FormField
        control={control}
        name='password'
        label='Password'
        secureTextEntry
        showPasswordToggle
        textContentType='newPassword'
        editable={!register.isPending}
      />
      <AppButton
        onPress={handleSubmit(onSubmit)}
        loading={register.isPending}
        disabled={register.isPending}
        fullWidth>
        Create account
      </AppButton>
      <AppView row justify='center' gap={1}>
        <AppText color='secondary'>Already have an account?</AppText>
        <Link href='/(auth)/login'>
          <AppText color='link'>Sign in</AppText>
        </Link>
      </AppView>
    </AuthScreen>
  );
}
