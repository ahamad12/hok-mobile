import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { AppToast } from '@/components/AppToast';
import { captureError } from '@/config/SentrySetup';
import { ColorProvider, useColors } from '@/contexts/ColorContext';
import { useInitAuth } from '@/features/auth/hooks/useInitAuth';
import { useInitSocket } from '@/hooks/useInitSocket';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import useThemeFonts from '@/hooks/useThemeFonts';
import { QueryClientProvider } from '@/providers/QueryClientProvider';

export default function RootLayout() {
  useInitAuth();
  useInitSocket();
  useSocketConnection();
  const fontsReady = useThemeFonts();

  // Wait for Plus Jakarta Sans so text never reflows from the system font.
  // useThemeFonts resolves on error too, so this can't block startup.
  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider>
        <ColorProvider>
          <NavigationTheme>
            <BottomSheetModalProvider>
              <ThemedStatusBar />
              <AppErrorBoundary onError={(e) => captureError(e)}>
                <Stack screenOptions={{ headerShown: false }} />
                <AppToast />
              </AppErrorBoundary>
            </BottomSheetModalProvider>
          </NavigationTheme>
        </ColorProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

/** Follows the resolved scheme, so "System" mode gets the right bar style. */
function ThemedStatusBar() {
  const { colors } = useColors();
  // With edge-to-edge the system bars show the native window background;
  // keep it in step with the page so they never show a stray white/black strip.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background.default).catch(() => {});
  }, [colors.background.default]);
  return <StatusBar style={colors.isDark ? 'light' : 'dark'} />;
}

/** Gives React Navigation our page colors so screen containers match. */
function NavigationTheme({ children }: { children: React.ReactNode }) {
  const { colors } = useColors();
  const theme = useMemo(() => {
    const base = colors.isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background.default,
        card: colors.background.default,
        text: colors.text.primary,
        border: 'transparent',
        primary: colors.brand.primary,
      },
    };
  }, [colors]);
  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
