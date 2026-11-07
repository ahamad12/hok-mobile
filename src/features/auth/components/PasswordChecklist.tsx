import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { getPasswordChecks } from '../utils/password';

/** Live strength meter + rule checklist shown under a new-password field. */
export function PasswordChecklist({ password }: { password: string }) {
  const { colors } = useColors();
  const checks = getPasswordChecks(password);
  const passed = checks.filter((c) => c.ok).length;
  const barColor =
    passed <= 2
      ? colors.status.error
      : passed <= 4
        ? colors.status.warning
        : colors.status.success;

  if (!password) return null;

  return (
    <View
      style={styles.wrap}
      accessibilityLabel={`Password strength ${passed} of ${checks.length}`}>
      <View style={styles.meter}>
        {checks.map((c, i) => (
          <View
            key={c.label}
            style={[
              styles.seg,
              {
                backgroundColor:
                  i < passed ? barColor : colors.background.subtle,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.list}>
        {checks.map((c) => (
          <View key={c.label} style={styles.item}>
            <AppIcon
              name={c.ok ? 'CircleCheck' : 'Circle'}
              size={14}
              color={c.ok ? colors.icon.success : colors.icon.tertiary}
            />
            <AppText
              variant='caption'
              customColor={c.ok ? colors.text.secondary : colors.text.tertiary}>
              {c.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[2], marginTop: -spacing[2] },
  meter: { flexDirection: 'row', gap: spacing[1] },
  seg: { flex: 1, height: 4, borderRadius: borderRadius.full },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[3],
    rowGap: 4,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
