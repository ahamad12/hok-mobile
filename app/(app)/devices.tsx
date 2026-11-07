import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppIcon, IconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { EmptyState } from '@/components/EmptyState';
import { IconTile, ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import {
  useLogout,
  useLogoutAll,
  useRevokeSession,
} from '@/features/auth/api/auth.mutations';
import { useSessions } from '@/features/auth/api/auth.queries';
import { Session } from '@/features/auth/api/auth.types';
import { deviceIcon, getDeviceKind } from '@/features/auth/utils/device';
import { useToast } from '@/hooks/useToast';
import { borderRadius, spacing } from '@/theme/Common';
import { formatRelativeTime } from '@/utils/time';

/** Devices signed in to this account; sign out one or all. */
export default function DevicesScreen() {
  const router = useRouter();
  const { colors } = useColors();
  const toast = useToast();
  const { data = [], isLoading, refetch, isRefetching } = useSessions();
  const revoke = useRevokeSession();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const confirm = useRef<ConfirmSheetRef>(null);

  // Current device first, then most recently active.
  const sessions = [...data].sort((a, b) =>
    a.isCurrent !== b.isCurrent
      ? a.isCurrent
        ? -1
        : 1
      : new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
  );
  const others = sessions.filter((s) => !s.isCurrent);

  const signOutDevice = (s: Session) =>
    confirm.current?.ask({
      title: s.isCurrent ? 'Sign out of this device?' : 'Sign out this device?',
      message: s.isCurrent
        ? 'You will need to sign in again here.'
        : `${s.deviceName ?? 'This device'} will be signed out right away.`,
      confirmLabel: 'Sign out',
      icon: 'LogOut',
      onConfirm: () =>
        s.isCurrent
          ? logout.mutateAsync()
          : revoke
              .mutateAsync(s.id)
              .then(() => toast.success('Device signed out')),
    });

  const signOutAll = () =>
    confirm.current?.ask({
      title: 'Sign out everywhere?',
      message: 'Every device, including this one, will be signed out.',
      confirmLabel: 'Sign out all',
      icon: 'ShieldOff',
      onConfirm: () => logoutAll.mutateAsync(),
    });

  const renderSession = (s: Session) => {
    const kind = getDeviceKind(s.userAgent, s.deviceName);
    const meta = [
      s.isCurrent
        ? 'Active now'
        : `Active ${formatRelativeTime(s.lastActiveAt)}`,
      s.ipAddress,
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <ListItem
        key={s.id}
        leading={
          <IconTile
            icon={deviceIcon[kind] as IconName}
            tone={s.isCurrent ? 'brand' : 'neutral'}
          />
        }
        title={s.deviceName ?? 'Unknown device'}
        subtitle={meta}
        trailing={
          <AppButton
            size='sm'
            variant='tertiary'
            onPress={() => signOutDevice(s)}
            accessibilityLabel={`Sign out ${s.deviceName ?? 'device'}`}>
            Sign out
          </AppButton>
        }>
        {s.isCurrent ? (
          <Badge
            label='This device'
            tone='success'
            icon='CircleCheck'
            style={styles.badge}
          />
        ) : null}
      </ListItem>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole='button'
          accessibilityLabel='Back'
          style={[styles.back, { backgroundColor: colors.background.surface }]}>
          <AppIcon name='ChevronLeft' size={20} color={colors.icon.default} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.text.primary}
          />
        }>
        <View style={styles.intro}>
          <AppText variant='h3' accessibilityRole='header'>
            Signed-in devices
          </AppText>
          <AppText variant='bodySmall' color='secondary'>
            Sign out anything you don't recognise. Signing out everywhere also
            signs out this device.
          </AppText>
        </View>
        {isLoading ? (
          <ListSection>
            <SkeletonRow />
            <SkeletonRow />
          </ListSection>
        ) : sessions.length === 0 ? (
          <EmptyState icon='MonitorSmartphone' title='No active sessions' />
        ) : (
          <>
            <ListSection title='This device'>
              {sessions.filter((s) => s.isCurrent).map(renderSession)}
            </ListSection>
            {others.length > 0 ? (
              <ListSection title={`Other devices · ${others.length}`}>
                {others.map(renderSession)}
              </ListSection>
            ) : (
              <AppText variant='caption' color='tertiary' align='center'>
                You're not signed in anywhere else.
              </AppText>
            )}
          </>
        )}
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background.default,
          },
        ]}>
        <AppButton
          variant='destructive'
          iconLeft='ShieldOff'
          loading={logoutAll.isPending}
          onPress={signOutAll}
          fullWidth>
          Sign out everywhere
        </AppButton>
      </View>
      <ConfirmSheet ref={confirm} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  back: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing[5],
    gap: spacing[6],
    paddingBottom: spacing[6],
  },
  intro: { gap: spacing[1] },
  badge: { marginTop: 4 },
  footer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
});
