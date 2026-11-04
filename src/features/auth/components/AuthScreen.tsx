import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { AppView } from '@/components/AppView';

type Props = {
  title: string;
  subtitle?: string;
  error?: string | null;
  children: ReactNode;
};

/** Keyboard-safe scrolling screen with a title and an optional form-level error. */
export function AuthScreen({ title, subtitle, error, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <AppView flex={1} bg='default'>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps='handled'>
          <AppView gap={2} mb={6}>
            <AppText variant='h2'>{title}</AppText>
            {subtitle ? <AppText color='secondary'>{subtitle}</AppText> : null}
          </AppView>
          <AppView gap={4}>
            {children}
            {error ? <AppText color='error'>{error}</AppText> : null}
          </AppView>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
});
