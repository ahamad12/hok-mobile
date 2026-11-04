import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { Divider } from '@/components/Divider';
import { getErrorMessage } from '@/constants/ApiErrors';
import {
  useChangePassword,
  useLogout,
  useUpdateProfile,
} from '@/features/auth/api/auth.mutations';
import { useAuthProfile } from '@/features/auth/api/auth.queries';
import {
  ChangePasswordFormValues,
  changePasswordSchema,
  UpdateProfileFormValues,
  updateProfileSchema,
} from '@/features/auth/schemas/auth.schemas';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading } = useAuthProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const logout = useLogout();

  const [profileServerError, setProfileServerError] = useState<string | null>(
    null,
  );
  const [passwordServerError, setPasswordServerError] = useState<string | null>(
    null,
  );

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName: '', username: null },
    mode: 'onTouched',
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        displayName: profile.displayName,
        username: profile.username,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <AppView flex={1} align='center' justify='center'>
        <AppActivityIndicator />
      </AppView>
    );
  }

  const handleSaveProfile = (values: UpdateProfileFormValues) => {
    setProfileServerError(null);
    const input = {
      ...(values.displayName !== profile.displayName
        ? { displayName: values.displayName?.trim() }
        : {}),
      ...(values.username !== profile.username
        ? { username: values.username }
        : {}),
    };
    if (Object.keys(input).length === 0) return;
    updateProfile.mutate(input, {
      onError: (error) => setProfileServerError(getErrorMessage(error)),
    });
  };

  const handleChangePassword = (values: ChangePasswordFormValues) => {
    setPasswordServerError(null);
    // Success revokes every session including this device — confirm first.
    Alert.alert(
      'Change password?',
      'You will be signed out on all devices, including this one.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change password',
          style: 'destructive',
          onPress: () =>
            changePassword.mutate(values, {
              // On success the session is wiped (guide §5) — no navigation
              // needed, the tabs guard redirects when status flips to signedOut.
              onError: (error) =>
                setPasswordServerError(getErrorMessage(error)),
            }),
        },
      ],
    );
  };

  return (
    <AppView flex={1} bg='default'>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps='handled'>
          <AppView gap={1}>
            <AppText variant='h3'>{profile.email}</AppText>
            <AppText variant='caption' color='secondary'>
              {profile.role}
              {profile.isSupervisor ? ' · Supervisor' : ''}
            </AppText>
          </AppView>

          <AppView mt={4} gap={4}>
            <Controller
              control={profileForm.control}
              name='displayName'
              render={({ field, fieldState }) => (
                <AppInput
                  label='Display name'
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!updateProfile.isPending}
                />
              )}
            />
            <Controller
              control={profileForm.control}
              name='username'
              render={({ field, fieldState }) => (
                <AppInput
                  label='Username'
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!updateProfile.isPending}
                />
              )}
            />
            {profileServerError && (
              <AppText color='error'>{profileServerError}</AppText>
            )}
            <AppButton
              onPress={profileForm.handleSubmit(handleSaveProfile)}
              loading={updateProfile.isPending}
              disabled={
                !profileForm.formState.isValid || updateProfile.isPending
              }
              fullWidth>
              Save profile
            </AppButton>
          </AppView>

          <Divider />

          <AppText variant='h3'>Change password</AppText>
          <AppView mt={4} gap={4}>
            <Controller
              control={passwordForm.control}
              name='currentPassword'
              render={({ field, fieldState }) => (
                <AppInput
                  label='Current password'
                  secureTextEntry
                  showPasswordToggle
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!changePassword.isPending}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name='newPassword'
              render={({ field, fieldState }) => (
                <AppInput
                  label='New password'
                  secureTextEntry
                  showPasswordToggle
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!changePassword.isPending}
                />
              )}
            />
            {passwordServerError && (
              <AppText color='error'>{passwordServerError}</AppText>
            )}
            <AppButton
              onPress={passwordForm.handleSubmit(handleChangePassword)}
              loading={changePassword.isPending}
              disabled={
                !passwordForm.formState.isValid || changePassword.isPending
              }
              fullWidth>
              Change password
            </AppButton>
          </AppView>

          <Divider />

          <AppButton
            variant='destructive'
            onPress={() => logout.mutate()}
            loading={logout.isPending}
            fullWidth>
            Sign out
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
});
