import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { AppView } from '@/components/AppView';
import { useColors } from '@/contexts/ColorContext';
import { useAuthStatus } from '@/features/auth/hooks/useAuth';

/**
 * Signed-in area, two levels deep:
 * - `(tenant)`: the business — Shops, Inbox, Team, Account (owners, managers)
 * - `shop/[shopId]`: one shop — Home, Scratch, Work, Money, More (everyone;
 *   staff live only here)
 * Account screens and modals are pushed on top of either.
 */
export default function AppLayout() {
  const { colors } = useColors();
  const status = useAuthStatus();

  if (status === 'restoring') {
    return (
      <AppView flex={1} align='center' justify='center' bg='default'>
        <ActivityIndicator color={colors.brand.primary} />
      </AppView>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href='/(auth)/login' />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.default },
      }}>
      <Stack.Screen name='(tenant)' />
      <Stack.Screen name='shop/[shopId]' />
      <Stack.Screen name='shop/new' options={{ presentation: 'modal' }} />
      <Stack.Screen name='invite-member' options={{ presentation: 'modal' }} />
    </Stack>
  );
}
