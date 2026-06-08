import { Stack } from 'expo-router';
import React from 'react';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'transparentModal',
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
