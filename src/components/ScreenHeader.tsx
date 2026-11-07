import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { spacing } from '@/theme/Common';

import { IconName } from './AppIcon';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

export interface ScreenHeaderProps {
  title: string;
  /** Small line above the title, e.g. a greeting. */
  eyebrow?: string;
  subtitle?: string;
  actionIcon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Main action gets the solid primary circle. */
  actionSolid?: boolean;
  style?: ViewStyle;
}

/** Large left-aligned title used at the top of each tab screen. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  eyebrow,
  subtitle,
  actionIcon,
  actionLabel,
  onAction,
  actionSolid = true,
  style,
}) => (
  <View style={[styles.row, style]}>
    <View style={styles.text}>
      {eyebrow ? (
        <AppText variant='bodySmall' color='tertiary' weight='medium'>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant='h2' accessibilityRole='header' numberOfLines={1}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant='bodySmall' color='secondary'>
          {subtitle}
        </AppText>
      ) : null}
    </View>
    {actionIcon && onAction ? (
      <IconButton
        icon={actionIcon}
        label={actionLabel ?? title}
        onPress={onAction}
        variant={actionSolid ? 'solid' : 'surface'}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
  },
  text: { flex: 1, gap: 2 },
});
