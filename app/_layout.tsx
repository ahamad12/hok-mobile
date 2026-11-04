import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { AppToast } from '@/components/AppToast';
import { captureError } from '@/config/SentrySetup';
import { COLOR_THEME } from '@/constants';
import { ColorProvider } from '@/contexts/ColorContext';
import { useInitAuth } from '@/features/auth/hooks/useInitAuth';
import { useInitSocket } from '@/hooks/useInitSocket';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { QueryClientProvider } from '@/providers/QueryClientProvider';
import { useSelectedTheme } from '@/store/selectors/appSelectors';

export default function RootLayout() {
  const selectedTheme = useSelectedTheme();
  useInitAuth();
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
            <AppErrorBoundary onError={(e) => captureError(e)}>
              <Stack screenOptions={{ headerShown: false }} />
              <AppToast />
            </AppErrorBoundary>
          </BottomSheetModalProvider>
        </ColorProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
