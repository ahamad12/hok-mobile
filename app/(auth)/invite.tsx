import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { ThemedView } from '@/components/ThemedView';
import { useColors } from '@/contexts/ColorContext';
import { useAcceptInvitation } from '@/features/auth/api/auth.mutations';
import {
  AuthScreen,
  FormField,
  PasswordChecklist,
  useServerErrors,
} from '@/features/auth/components';
import {
  AcceptInvitationFormValues,
  acceptInvitationSchema,
} from '@/features/auth/schemas/auth.schemas';
import { borderRadius, spacing } from '@/theme/Common';

/**
 * Opened from the invitation email: <scheme>://invite?token=…
 * The invitee picks a name and password and is signed in.
 */
export default function AcceptInviteScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { colors } = useColors();
  const accept = useAcceptInvitation();
  const { control, handleSubmit, setError } =
    useForm<AcceptInvitationFormValues>({
      resolver: zodResolver(acceptInvitationSchema),
      defaultValues: { displayName: '', password: '', username: '' },
      mode: 'onTouched',
    });
  const password = useWatch({ control, name: 'password' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'displayName',
    'password',
    'username',
  ]);

  if (!token) {
    return (
      <ThemedView>
        <View style={styles.center}>
          <EmptyState
            icon='Unlink'
            title='This invitation link is incomplete'
            body='Open the link from your invitation email again, or ask whoever invited you to send a new one.'
            actionLabel='Back to sign in'
            onAction={() => router.replace('/(auth)/login')}
          />
        </View>
      </ThemedView>
    );
  }

  const onSubmit = ({ username, ...rest }: AcceptInvitationFormValues) => {
    setFormError(null);
    accept.mutate(
      { ...rest, ...(username ? { username } : {}), token },
      { onError },
    );
  };

  return (
    <AuthScreen
      title='Join your team'
      subtitle='Set your name and a password to finish your account.'
      error={formError}
      footer={
        <View style={styles.footerRow}>
          <AppText color='secondary'>Already set up?</AppText>
          <Link href='/(auth)/login'>
            <AppText color='link' weight='semibold'>
              Sign in
            </AppText>
          </Link>
        </View>
      }>
      <View
        style={[styles.invite, { backgroundColor: colors.background.surface }]}>
        <View
          style={[
            styles.inviteIcon,
            { backgroundColor: colors.background.default },
          ]}>
          <AppIcon name='MailCheck' size={20} color={colors.icon.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant='label' weight='semibold'>
            You've been invited
          </AppText>
          <AppText variant='caption' color='secondary'>
            Your role and shop were set by the person who invited you. Your
            email comes from the invitation.
          </AppText>
        </View>
      </View>

      <FormField
        control={control}
        name='displayName'
        label='Your name'
        iconLeft='UserRound'
        autoComplete='name'
        textContentType='name'
        editable={!accept.isPending}
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
        editable={!accept.isPending}
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
        editable={!accept.isPending}
        required
      />
      <PasswordChecklist password={password ?? ''} />
      <AppButton
        variant='brand'
        onPress={handleSubmit(onSubmit)}
        loading={accept.isPending}
        disabled={accept.isPending}
        size='lg'
        fullWidth>
        Accept invitation
      </AppButton>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  invite: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  inviteIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[1],
  },
});
