import { useRouter } from 'expo-router';
import React from 'react';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { Divider } from '@/components/Divider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useUser } from '@/features/auth/hooks/useAuth';
import { invitableRoles } from '@/features/auth/utils/role';

export default function HomeScreen() {
  const router = useRouter();
  const user = useUser();

  const canInvite = user ? invitableRoles(user.role).length > 0 : false;

  return (
    <AppView flex={1} p={6} gap={4}>
      <AppView gap={1}>
        <AppText variant='h2'>Hello{user ? `, ${user.displayName}` : ''}</AppText>
        <AppText color='secondary'>
          {user ? `${user.role}${user.isSupervisor ? ' · Supervisor' : ''}` : 'Welcome to TAPT'}
        </AppText>
      </AppView>

      <Divider />

      <AppView gap={3}>
        <AppButton
          variant='secondary'
          fullWidth
          iconLeft='User'
          onPress={() => router.push('/(tabs)/profile')}>
          Profile & settings
        </AppButton>
        <AppButton
          variant='secondary'
          fullWidth
          iconLeft='Smartphone'
          onPress={() => router.push('/(tabs)/sessions')}>
          Signed-in devices
        </AppButton>
        {canInvite && (
          <AppButton
            variant='secondary'
            fullWidth
            iconLeft='Users'
            onPress={() => router.push('/(tabs)/staff')}>
            Team & invitations
          </AppButton>
        )}
      </AppView>

      <Divider />

      <AppView row align='center' justify='space-between'>
        <AppText color='secondary'>Appearance</AppText>
        <ThemeToggle size='sm' />
      </AppView>
    </AppView>
  );
}
