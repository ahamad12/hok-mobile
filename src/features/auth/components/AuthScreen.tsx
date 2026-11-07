import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { CARVE_MS, HokWordmark } from '@/components/HokMark';
import { useColors } from '@/contexts/ColorContext';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

const { ink, bone, rust } = palette.hok;

type Props = {
  title: string;
  subtitle?: string;
  error?: string | null;
  /** Content under the form (links, notes). */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Hok auth layout: one flat field (black in dark mode, white in light) with
 * the carved HOK wordmark centred at the top. Everything below is
 * left-aligned; the rust main button is the only accent. Keyboard-safe.
 */
export function AuthScreen({ title, subtitle, error, footer, children }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();
  const still = useReducedMotion();
  const ground = colors.isDark ? ink : '#FFFFFF';

  // The form rises in once, as the last cut of the wordmark lands.
  const enter = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (!still) {
      enter.value = withDelay(
        CARVE_MS - 240,
        withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [enter, still]);
  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  return (
    <View style={[styles.flex, { backgroundColor: ground }]}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + spacing[12],
              paddingBottom: insets.bottom + spacing[8],
            },
          ]}
          keyboardShouldPersistTaps='handled'>
          <View style={styles.mark}>
            <HokWordmark height={56} color={colors.isDark ? bone : ink} />
          </View>

          <Animated.View style={enterStyle}>
            <View style={styles.heading}>
              <AppText variant='h1' accessibilityRole='header'>
                {title}
              </AppText>
              {subtitle ? (
                <AppText variant='body' color='secondary'>
                  {subtitle}
                </AppText>
              ) : null}
            </View>

            {error ? (
              <View
                style={[
                  styles.error,
                  { backgroundColor: colors.background.errorSubtle },
                ]}
                accessibilityRole='alert'>
                <AppIcon name='CircleAlert' size={18} color={rust} />
                <AppText variant='bodySmall' color='error' style={styles.flex}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <View style={styles.form}>{children}</View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing[6] },
  mark: { alignItems: 'center', marginBottom: spacing[12] },
  heading: { gap: spacing[2], marginBottom: spacing[8] },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: rust,
    marginBottom: spacing[5],
  },
  form: { gap: spacing[4] },
  footer: { paddingTop: spacing[8], gap: spacing[5] },
});
