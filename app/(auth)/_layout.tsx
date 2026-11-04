import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { AppView } from '@/components/AppView';
import { useColors } from '@/contexts/ColorContext';
import { useAuthStatus } from '@/features/auth/hooks/useAuth';

export default function AuthLayout() {
  const status = useAuthStatus();
  const { colors } = useColors();

  if (status === 'restoring') {
    return (
      <AppView flex={1} align='center' justify='center' bg='default'>
        <ActivityIndicator color={colors.brand.primary} />
      </AppView>
    );
  }

  if (status === 'signedIn') {
    return <Redirect href='/(tabs)' />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
