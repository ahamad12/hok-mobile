import { Tabs } from 'expo-router';
import React from 'react';

import { AppIcon } from '@/components/AppIcon';
import { FloatingTabBar } from '@/components/FloatingTabBar';
import { useCapabilities } from '@/features/shops/hooks/useShopContext';
import { useToday } from '@/features/shops/hooks/useToday';
import { shopTabsFor } from '@/features/shops/utils/shopTabs';

export const unstable_settings = { initialRouteName: 'index' };

/**
 * The shop tab bar, by role (see shopTabs.ts): owners and managers get
 * Today · Work · Finance · Records · More, supervisors Shift · Till ·
 * Deliveries · Work · More, staff Shift · Scratch · Deliveries · Work ·
 * More. Every route stays registered; hidden ones get `href: null` and no
 * icon (FloatingTabBar filters on both).
 */
export default function ShopTabsLayout() {
  const caps = useCapabilities();
  const tabs = shopTabsFor(caps);
  // One badge only: Today = how many things need you (shared query keys,
  // so this costs nothing extra once Today has loaded).
  const needsYou = useToday(caps.shell === 'oversight').needsYou.length;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      {/* Landing redirect: always first, never shown in the bar. */}
      <Tabs.Screen name='index' options={{ href: null }} />
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={
            t.visible
              ? {
                  title: t.title,
                  tabBarBadge:
                    t.name === 'today' && needsYou > 0 ? needsYou : undefined,
                  tabBarIcon: ({ color, size }) => (
                    <AppIcon name={t.icon} color={String(color)} size={size} />
                  ),
                }
              : { title: t.title, href: null }
          }
        />
      ))}
    </Tabs>
  );
}
