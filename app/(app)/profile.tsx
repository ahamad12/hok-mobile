import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { IconButton } from '@/components/IconButton';
import { ListItem, ListSection } from '@/components/ListItem';
import { ProfileHero } from '@/components/ProfileHero';
import { Skeleton } from '@/components/Skeleton';
import { getErrorMessage } from '@/constants/ApiErrors';
import { useColors } from '@/contexts/ColorContext';
import { useUpdateProfile } from '@/features/auth/api/auth.mutations';
import { useAuthProfile } from '@/features/auth/api/auth.queries';
import { FormField } from '@/features/auth/components';
import { useUser } from '@/features/auth/hooks/useAuth';
import {
  UpdateProfileFormValues,
  updateProfileSchema,
} from '@/features/auth/schemas/auth.schemas';
import { roleLabel } from '@/features/auth/utils/role';
import { useToast } from '@/hooks/useToast';
import { borderRadius, spacing } from '@/theme/Common';
import { formatRelativeTime, formatShortDate } from '@/utils/time';

export default function ProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { colors } = useColors();
  const bottom = useSafeAreaInsets().bottom + spacing[10];
  const sessionUser = useUser();
  const { data: profile } = useAuthProfile();
  const updateProfile = useUpdateProfile();
  const [serverError, setServerError] = useState<string | null>(null);

  const me = profile ?? sessionUser;

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { displayName: '', username: null },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName,
        username: profile.username,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const save = (values: UpdateProfileFormValues) => {
    if (!profile) return;
    setServerError(null);
    const username = values.username?.trim() ? values.username.trim() : null;
    const input = {
      ...(values.displayName !== profile.displayName
        ? { displayName: values.displayName?.trim() }
        : {}),
      ...(username !== profile.username ? { username } : {}),
    };
    if (Object.keys(input).length === 0) return;
    updateProfile.mutate(input, {
      onSuccess: () => toast.success('Profile updated'),
      onError: (error) => setServerError(getErrorMessage(error)),
    });
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.pad, { paddingBottom: bottom }]}
          keyboardShouldPersistTaps='handled'>
          <IconButton
            icon='ChevronLeft'
            label='Back'
            onPress={() => router.back()}
            style={styles.back}
          />
          <ProfileHero name={me?.displayName} email={me?.email}>
            {me ? (
              <>
                <Badge label={roleLabel(me.role)} tone='brand' />
                {me.isSupervisor ? (
                  <Badge label='Supervisor' tone='info' />
                ) : null}
              </>
            ) : null}
          </ProfileHero>

          <View style={styles.group}>
            <AppText variant='label' color='secondary' style={styles.heading}>
              Personal details
            </AppText>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.background.surface },
              ]}>
              {profile ? (
                <>
                  <FormField
                    control={form.control}
                    name='displayName'
                    label='Display name'
                    editable={!updateProfile.isPending}
                    wrapperStyle={{
                      backgroundColor: colors.background.default,
                    }}
                  />
                  <FormField
                    control={form.control}
                    name='username'
                    label='Username'
                    helperText='Optional · leave empty to remove'
                    autoCapitalize='none'
                    autoCorrect={false}
                    editable={!updateProfile.isPending}
                    wrapperStyle={{
                      backgroundColor: colors.background.default,
                    }}
                  />
                  {serverError ? (
                    <AppText variant='bodySmall' color='error'>
                      {serverError}
                    </AppText>
                  ) : null}
                  <AppButton
                    onPress={form.handleSubmit(save)}
                    loading={updateProfile.isPending}
                    disabled={
                      !form.formState.isDirty || updateProfile.isPending
                    }
                    fullWidth>
                    Save changes
                  </AppButton>
                </>
              ) : (
                <View style={styles.skeleton}>
                  <Skeleton height={52} radius={14} />
                  <Skeleton height={52} radius={14} />
                </View>
              )}
            </View>
          </View>

          <ListSection title='Security'>
            <ListItem
              icon='KeyRound'
              title='Change password'
              subtitle='Signs you out on every device'
              onPress={() => router.push('/change-password')}
            />
            <ListItem
              icon='MonitorSmartphone'
              title='Signed-in devices'
              subtitle='See where you are signed in'
              onPress={() => router.push('/devices')}
            />
          </ListSection>

          {profile ? (
            <ListSection title='Account'>
              <ListItem
                icon='CalendarDays'
                title='Member since'
                value={formatShortDate(profile.createdAt)}
              />
              <ListItem
                icon='LogIn'
                title='Last sign-in'
                value={
                  profile.lastLoginAt
                    ? formatRelativeTime(profile.lastLoginAt)
                    : '—'
                }
              />
            </ListSection>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { marginTop: spacing[2] },
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[4], gap: spacing[7] },
  group: { gap: spacing[2] },
  heading: { paddingHorizontal: spacing[1] },
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    gap: spacing[4],
  },
  skeleton: { gap: spacing[3] },
});
