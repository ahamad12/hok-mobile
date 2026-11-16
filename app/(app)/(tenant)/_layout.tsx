import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { AppIcon } from '@/components/AppIcon';
import { EmptyState } from '@/components/EmptyState';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { ThemedView } from '@/components/ThemedView';
import { useLogout } from '@/features/auth/api/auth.mutations';
import { useUser } from '@/features/auth/hooks/useAuth';

/**
 * Business-level tabs for owners and managers: the first screen when they
 * have 0 or 2+ shops, and reachable from every shop's More tab. Staff have
 * no business level: they go straight to their shop. The Inbox is hidden
 * until the API has a cross-shop attention endpoint (it was sample data).
 */
export default function TenantTabsLayout() {
  const user = useUser();
  const logout = useLogout();

  if (user?.role === 'STAFF') {
    if (user.shopId) {
      return (
        <Redirect
          href={{
            pathname: '/shop/[shopId]',
            params: { shopId: user.shopId },
          }}
        />
      );
    }
    return (
      <ThemedView style={{ justifyContent: 'center' }}>
        <EmptyState
          icon='Store'
          title='No shop yet'
          body='Ask your manager or owner to add you to a shop, then sign in again.'
          actionLabel='Sign out'
          actionIcon='LogOut'
          onAction={() => logout.mutate()}
        />
      </ThemedView>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name='shops'
        options={{
          title: 'Hoks',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name='Store' color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen name='inbox' options={{ title: 'Inbox', href: null }} />
      <Tabs.Screen
        name='team'
        options={{
          title: 'Team',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name='UsersRound' color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='account'
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name='CircleUserRound' color={String(color)} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
