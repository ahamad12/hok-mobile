import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { COLOR_THEME } from '@/constants';
import { ColorProvider } from '@/contexts/ColorContext';
import { QueryClientProvider } from '@/providers/QueryClientProvider';
import { useSelectedTheme } from '@/store/selectors/appSelectors';

export default function RootLayout() {
  const selectedTheme = useSelectedTheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider>
        <ColorProvider>
          <StatusBar
            style={selectedTheme === COLOR_THEME.DARK ? 'light' : 'dark'}
          />
          <Stack screenOptions={{ headerShown: false }} />
        </ColorProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
