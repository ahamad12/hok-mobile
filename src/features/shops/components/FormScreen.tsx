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
import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

type Props = {
  title: string;
  /** 'close' for modals, 'back' for pushed screens. */
  dismiss?: 'close' | 'back';
  error?: string | null;
  /** Pinned to the bottom (primary actions). */
  footer?: ReactNode;
  children: ReactNode;
};

/** Full-screen form shell: top bar, scrolling body, pinned action bar. */
export function FormScreen({
  title,
  dismiss = 'back',
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
          style={[
            styles.iconBtn,
            { backgroundColor: colors.background.surface },
          ]}>
          <AppIcon
            name={dismiss === 'close' ? 'X' : 'ChevronLeft'}
            size={20}
            color={colors.icon.default}
          />
        </Pressable>
        <AppText variant='h6' numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <View style={styles.iconBtn} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps='handled'>
          {error ? (
            <View
              accessibilityRole='alert'
              style={[
                styles.error,
                { backgroundColor: colors.background.errorSubtle },
              ]}>
              <AppIcon name='CircleAlert' size={18} color={colors.icon.error} />
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  title: { flex: 1, textAlign: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[6],
  },
  error: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
});
