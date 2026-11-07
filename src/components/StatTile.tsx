import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { AppText } from './AppText';
import { Skeleton } from './Skeleton';

export interface StatTileProps {
  label: string;
  value: string;
  /** Small line under the value ("12 tickets", "since 08:00"). */
  hint?: string;
  tone?: 'default' | 'success' | 'error' | 'warning';
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/** One number on a tonal surface. Lay several out in a row. */
export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  hint,
  tone = 'default',
  loading,
  onPress,
  style,
}) => {
  const { colors } = useColors();
  const valueColor =
    tone === 'success'
      ? colors.text.success
      : tone === 'error'
        ? colors.text.error
        : tone === 'warning'
          ? colors.text.warning
          : colors.text.primary;

  const body = (
    <>
      <AppText variant='caption' color='secondary' numberOfLines={1}>
        {label}
      </AppText>
      {loading ? (
        <Skeleton width='70%' height={24} />
      ) : (
        <AppText
          variant='h5'
          customColor={valueColor}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {value}
        </AppText>
      )}
      {hint ? (
        <AppText variant='caption' color='tertiary' numberOfLines={1}>
          {hint}
        </AppText>
      ) : null}
    </>
  );

  const base = [
    styles.tile,
    { backgroundColor: colors.background.surface },
    style,
  ];
  if (!onPress) return <View style={base}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole='button'
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [
        base,
        pressed && { backgroundColor: colors.background.subtle },
      ]}>
      {body}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 92,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[1],
    justifyContent: 'center',
  },
});
