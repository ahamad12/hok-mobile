import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';
import { useColors } from '@/contexts/ColorContext';
import { useAuthStatus, useUser } from '@/features/auth/hooks/useAuth';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { entryHref } from '@/features/shops/utils/capabilities';

export default function Index() {
  const status = useAuthStatus();
  const user = useUser();
  const shops = useMyShops();
  const { colors } = useColors();

  // Owners and managers need their shop count to pick the landing.
  const waitingForShops = user?.role !== 'STAFF' && shops.isLoading;

  if (status === 'restoring' || (status === 'signedIn' && waitingForShops)) {
    return (
      <AppView flex={1} align='center' justify='center' bg='default' gap={4}>
        <ActivityIndicator color={colors.brand.primary} />
        <AppText color='secondary'>Opening your hoks…</AppText>
      </AppView>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href='/(auth)/login' />;
  }

  const target = entryHref(
    user,
    (shops.data ?? []).map((s) => s.id),
  );
  if (target === 'shops') return <Redirect href='/shops' />;
  return <Redirect href={{ pathname: '/shop/[shopId]', params: target }} />;
}
