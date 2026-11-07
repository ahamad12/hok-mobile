import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/FloatingTabBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColors } from '@/contexts/ColorContext';
import {
  AccountCard,
  AccountSections,
} from '@/features/auth/components/AccountSections';
import { spacing } from '@/theme/Common';

/** Profile, password, devices, appearance, language and sign-out. */
export default function AccountScreen() {
  const { colors } = useColors();
  const bottom = useTabBarInset();
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: bottom }]}>
        <ScreenHeader title='Account' />
        <AccountCard />
        <AccountSections />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[5], gap: spacing[6] },
});
