import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { verticalScale } from 'react-native-size-matters';

import { AppView } from '@/components/AppView';
import { useColors } from '@/contexts/ColorContext';
import { useAuthStatus } from '@/features/auth/hooks/useAuth';

const TabsLayout = () => {
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
    <Tabs
      screenOptions={{
        tabBarLabelStyle: {
          marginTop: verticalScale(4),
        },
        tabBarStyle: {
          backgroundColor: colors.background.default,
          height: verticalScale(70),
          paddingBottom: verticalScale(20),
        },
        tabBarItemStyle: { paddingVertical: verticalScale(10) },
        tabBarActiveTintColor: colors.icon.secondary,
        tabBarInactiveTintColor: colors.icon.disabled,
      }}>
      <Tabs.Screen name='index' options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name='profile' options={{ title: 'Profile', headerShown: false }} />
      {/* Pushed from Home, not tabs. */}
      <Tabs.Screen name='sessions' options={{ href: null, title: 'Devices' }} />
      <Tabs.Screen name='staff/index' options={{ href: null, title: 'Team' }} />
      <Tabs.Screen name='staff/create' options={{ href: null, title: 'Invite' }} />
    </Tabs>
  );
};

export default TabsLayout;
