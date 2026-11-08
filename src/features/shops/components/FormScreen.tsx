import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { PageTitle } from '@/components/PageTitle';
import { useColors } from '@/contexts/ColorContext';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

type Props = {
  title: string;
  /** One line under the title. */
  subtitle?: string;
  /** 'close' for modals, 'back' for pushed screens. */
  dismiss?: 'close' | 'back';
  /** Right side of the top bar (e.g. a wizard's step tally). */
  headerRight?: ReactNode;
  /** Set false when the body draws its own heading (wizard steps). */
  showTitle?: boolean;
  error?: string | null;
  /** Pinned to the bottom (primary actions). */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Full-screen form shell: a square back/close button, the page title in the
 * logo's style, a scrolling body, and a pinned action bar.
 */
export function FormScreen({
  title,
  subtitle,
  dismiss = 'back',
  headerRight,
  showTitle = true,
  error,
  footer,
  children,
}: Props) {
  const router = useRouter();
  const { colors } = useColors();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole='button'
          accessibilityLabel={dismiss === 'close' ? 'Close' : 'Back'}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: pressed
                ? colors.background.subtle
                : colors.background.surface,
            },
          ]}>
          <AppIcon
            name={dismiss === 'close' ? 'X' : 'ChevronLeft'}
            size={20}
            color={colors.icon.default}
          />
        </Pressable>
        {headerRight}
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps='handled'>
          {showTitle ? (
            <PageTitle title={title} subtitle={subtitle} size='form' />
          ) : null}
          {error ? (
            <View
              accessibilityRole='alert'
              style={[
                styles.error,
                { backgroundColor: colors.background.errorSubtle },
              ]}>
              <AppIcon name='CircleAlert' size={18} color={palette.hok.rust} />
              <AppText variant='bodySmall' color='error' style={styles.flex}>
                {error}
              </AppText>
            </View>
          ) : null}
          {children}
        </ScrollView>
        {footer ? (
          <View
            style={[
              styles.footer,
              { backgroundColor: colors.background.default },
            ]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
    gap: spacing[6],
  },
  error: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: palette.hok.rust,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
});
