import React from 'react';
import { Alert, FlatList } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { Divider } from '@/components/Divider';
import {
  useLogoutAll,
  useRevokeSession,
} from '@/features/auth/api/auth.mutations';
import { useSessions } from '@/features/auth/api/auth.queries';

/** Devices signed in to this account; sign out one or all. */
export default function SessionsScreen() {
  const { data = [], isLoading, refetch, isRefetching } = useSessions();
  const revoke = useRevokeSession();
  const logoutAll = useLogoutAll();

  const confirmLogoutAll = () =>
    Alert.alert('Sign out everywhere?', 'This device will be signed out too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out all',
        style: 'destructive',
        onPress: () => logoutAll.mutate(),
      },
    ]);

  return (
    <AppView flex={1} p={6} gap={4} bg='default'>
      <AppText variant='h2'>Signed-in devices</AppText>
      {isLoading ? (
        <AppActivityIndicator />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(s) => s.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => (
            <AppView row align='center' justify='space-between' py={3}>
              <AppView flex={1} gap={1}>
                <AppText>
                  {item.deviceName ?? 'Unknown device'}
                  {item.isCurrent ? ' (this device)' : ''}
                </AppText>
                <AppText variant='bodySmall' color='secondary'>
                  Last active {new Date(item.lastActiveAt).toLocaleString()}
                </AppText>
              </AppView>
              {!item.isCurrent && (
                <AppButton
                  size='sm'
                  variant='outline'
                  disabled={revoke.isPending}
                  onPress={() => revoke.mutate(item.id)}>
                  Sign out
                </AppButton>
              )}
            </AppView>
          )}
        />
      )}
      <AppButton
        variant='destructive'
        fullWidth
        loading={logoutAll.isPending}
        onPress={confirmLogoutAll}>
        Sign out everywhere
      </AppButton>
    </AppView>
  );
}
