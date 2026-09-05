import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppToast } from '@/components/AppToast';
import { COLOR_THEME } from '@/constants';
import { ColorProvider } from '@/contexts/ColorContext';
import { useInitSocket } from '@/hooks/useInitSocket';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { QueryClientProvider } from '@/providers/QueryClientProvider';
import { useSelectedTheme } from '@/store/selectors/appSelectors';

export default function RootLayout() {
  const selectedTheme = useSelectedTheme();
  useInitSocket();
  useSocketConnection();

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider>
        <ColorProvider>
          <BottomSheetModalProvider>
            <StatusBar
              style={selectedTheme === COLOR_THEME.DARK ? 'light' : 'dark'}
            />
            <Stack screenOptions={{ headerShown: false }} />
            <AppToast />
          </BottomSheetModalProvider>
        </ColorProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
