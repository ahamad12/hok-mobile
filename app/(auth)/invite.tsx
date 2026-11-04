import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { useAcceptInvitation } from '@/features/auth/api/auth.mutations';
import {
  AuthScreen,
  FormField,
  useServerErrors,
} from '@/features/auth/components';
import {
  AcceptInvitationFormValues,
  acceptInvitationSchema,
} from '@/features/auth/schemas/auth.schemas';

/**
 * Opened from the invitation email: <scheme>://invite?token=…
 * The invitee picks a name and password and is signed in.
 */
export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const accept = useAcceptInvitation();
  const { control, handleSubmit, setError } =
    useForm<AcceptInvitationFormValues>({
      resolver: zodResolver(acceptInvitationSchema),
      defaultValues: { displayName: '', password: '' },
      mode: 'onTouched',
    });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'displayName',
    'password',
  ]);

  if (!token) {
    return (
      <AuthScreen
        title='Invitation link is incomplete'
        subtitle='Open the link from your invitation email again, or ask for a new invitation.'>
        <Link href='/(auth)/login'>
          <AppText color='link'>Back to sign in</AppText>
        </Link>
      </AuthScreen>
    );
  }

  const onSubmit = (values: AcceptInvitationFormValues) => {
    setFormError(null);
    accept.mutate({ ...values, token }, { onError });
  };

  return (
    <AuthScreen
      title='Join your team'
      subtitle='Set your name and a password to finish your account.'
      error={formError}>
      <FormField
        control={control}
        name='displayName'
        label='Your name'
        editable={!accept.isPending}
      />
      <FormField
        control={control}
        name='password'
        label='Password'
        secureTextEntry
        showPasswordToggle
        textContentType='newPassword'
        editable={!accept.isPending}
      />
      <AppButton
        onPress={handleSubmit(onSubmit)}
        loading={accept.isPending}
        disabled={accept.isPending}
        fullWidth>
        Accept invitation
      </AppButton>
    </AuthScreen>
  );
}
