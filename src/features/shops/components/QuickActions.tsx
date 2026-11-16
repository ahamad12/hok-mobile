import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, IconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

export type QuickAction = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

/**
 * A row of shortcut tiles, so an owner or manager covering the counter can
 * scan, log a delivery, add a till entry or set a task without the shift
 * tabs.
 */
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const { colors } = useColors();
  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <Pressable
          key={a.key}
          onPress={a.onPress}
          accessibilityRole='button'
          accessibilityLabel={a.label}
          style={({ pressed }) => [
            styles.tile,
            {
              backgroundColor: colors.background.surface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <AppIcon name={a.icon} size={22} color={colors.brand.primary} />
          <AppText variant='caption' weight='semibold' numberOfLines={1}>
            {a.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[2] },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
  },
});
