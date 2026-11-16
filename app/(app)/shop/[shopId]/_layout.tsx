import { Stack } from 'expo-router';
import React from 'react';

import { useColors } from '@/contexts/ColorContext';

// Quick-capture forms open as modals; everything else pushes.
const MODALS = [
  'tasks/new',
  'tickets/new',
  'till/new',
  'deliveries/new',
  'deliveries/edit',
  'licenses/new',
  'forms/new',
];

/**
 * Inside one shop: the role's five shop tabs, with detail and form screens pushed
 * over them (covering the tab bar).
 */
export default function ShopLayout() {
  const { colors } = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.default },
      }}>
      <Stack.Screen name='(tabs)' />
      {MODALS.map((name) => (
        <Stack.Screen
          key={name}
          name={name}
          options={{ presentation: 'modal' }}
        />
      ))}
    </Stack>
  );
}
