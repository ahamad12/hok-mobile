import { Redirect, Tabs } from 'expo-router';
import React, { useMemo } from 'react';

import { AppIcon } from '@/components/AppIcon';
import { EmptyState } from '@/components/EmptyState';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { ThemedView } from '@/components/ThemedView';
import { useLogout } from '@/features/auth/api/auth.mutations';
import { useUser } from '@/features/auth/hooks/useAuth';
import { buildSampleInbox, countItems } from '@/features/inbox/inbox.mock';
import { useMyShops } from '@/features/shops/api/shops.queries';

/**
 * Business-level tabs for owners and managers. Staff have no business
 * level: they go straight to their shop.
 */
export default function TenantTabsLayout() {
  const user = useUser();
  const logout = useLogout();
  const shops = useMyShops();
  // Attention count, not "unread": there is no read state server-side.
  const attention = useMemo(
    () => countItems(buildSampleInbox(shops.data ?? [], false)),
    [shops.data],
  );

  if (user?.role === 'STAFF') {
    if (user.shopId) {
      return (
        <Redirect
          href={{
            pathname: '/shop/[shopId]/home',
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
          title: 'Shops',
          tabBarIcon: ({ color, size }) => (
            <AppIcon name='Store' color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='inbox'
        options={{
          title: 'Inbox',
          tabBarBadge: attention > 0 ? attention : undefined,
          tabBarIcon: ({ color, size }) => (
            <AppIcon name='Inbox' color={String(color)} size={size} />
          ),
        }}
      />
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
