import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { useColors } from '@/contexts/ColorContext';
import { useAuthStatus, useUser } from '@/features/auth/hooks/useAuth';

export default function Index() {
  const status = useAuthStatus();
  const user = useUser();
  const { colors } = useColors();

  if (status === 'restoring') {
    return (
      <AppView flex={1} align='center' justify='center' bg='default' gap={4}>
        <ActivityIndicator color={colors.brand.primary} />
        <AppText color='secondary'>Restoring session…</AppText>
      </AppView>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href='/(auth)/login' />;
  }

  // Staff live inside their one shop; owners and managers start at Shops.
  if (user?.role === 'STAFF' && user.shopId) {
    return (
      <Redirect
        href={{
          pathname: '/shop/[shopId]/home',
          params: { shopId: user.shopId },
        }}
      />
    );
  }
  return <Redirect href='/shops' />;
}
