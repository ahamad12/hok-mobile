import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { useRegister } from '@/features/auth/api/auth.mutations';
import {
  AuthScreen,
  FormField,
  PasswordChecklist,
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
    defaultValues: { email: '', password: '', displayName: '', username: '' },
    mode: 'onTouched',
  });
  const password = useWatch({ control, name: 'password' });
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
      title='Open your Hok'
      subtitle='Create the owner account. Add shops and invite staff after.'
      error={formError}
      footer={
        <AppView row justify='center' gap={1}>
          <AppText color='secondary'>Already have an account?</AppText>
          <Link href='/(auth)/login'>
            <AppText color='link' weight='semibold'>
              Sign in
            </AppText>
          </Link>
        </AppView>
      }>
      <FormField
        control={control}
        name='displayName'
        label='Your name'
        iconLeft='UserRound'
        autoComplete='name'
        textContentType='name'
        editable={!register.isPending}
        required
      />
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
        editable={!register.isPending}
        required
      />
      <FormField
        control={control}
        name='username'
        label='Username'
        iconLeft='AtSign'
        helperText='Optional · 3–30 characters'
        autoCapitalize='none'
        autoCorrect={false}
        textContentType='username'
        editable={!register.isPending}
      />
      <FormField
        control={control}
        name='password'
        label='Password'
        iconLeft='LockKeyhole'
        secureTextEntry
        showPasswordToggle
        autoComplete='new-password'
        textContentType='newPassword'
        editable={!register.isPending}
        required
      />
      <PasswordChecklist password={password ?? ''} />
      <AppButton
        variant='brand'
        onPress={handleSubmit(onSubmit)}
        loading={register.isPending}
        disabled={register.isPending}
        size='lg'
        fullWidth>
        Create owner account
      </AppButton>
    </AuthScreen>
  );
}
