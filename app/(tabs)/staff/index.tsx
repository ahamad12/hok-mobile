import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { Divider } from '@/components/Divider';
import {
  useResendInvitation,
  useRevokeInvitation,
} from '@/features/auth/api/auth.mutations';
import { usePendingInvitations } from '@/features/auth/api/auth.queries';
import { useToast } from '@/hooks/useToast';

/** Pending invitations with resend / revoke, plus the entry to invite someone. */
export default function TeamScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data = [], isLoading, refetch, isRefetching } =
    usePendingInvitations();
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();

  return (
    <AppView flex={1} p={6} gap={4} bg='default'>
      <AppText variant='h2'>Team</AppText>
      <AppButton
        iconLeft='UserPlus'
        fullWidth
        onPress={() => router.push('/(tabs)/staff/create')}>
        Invite someone
      </AppButton>
      <AppText color='secondary'>Pending invitations</AppText>
      {isLoading ? (
        <AppActivityIndicator />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={
            <AppText color='secondary'>No pending invitations.</AppText>
          }
          renderItem={({ item }) => (
            <AppView py={3} gap={2}>
              <AppText>{item.email}</AppText>
              <AppText variant='bodySmall' color='secondary'>
                {item.role === 'MANAGER' ? 'Manager' : 'Staff'}
                {item.isSupervisor ? ' · Supervisor' : ''} · expires{' '}
                {new Date(item.expiresAt).toLocaleDateString()}
              </AppText>
              <AppView row gap={2}>
                <AppButton
                  size='sm'
                  variant='outline'
                  disabled={resend.isPending}
                  onPress={() =>
                    resend.mutate(item.id, {
                      onSuccess: () => toast.success('Invitation resent'),
                    })
                  }>
                  Resend
                </AppButton>
                <AppButton
                  size='sm'
                  variant='destructive'
                  disabled={revoke.isPending}
                  onPress={() => revoke.mutate(item.id)}>
                  Revoke
                </AppButton>
              </AppView>
            </AppView>
          )}
        />
      )}
    </AppView>
  );
}
