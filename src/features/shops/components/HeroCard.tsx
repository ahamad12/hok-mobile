import React, { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

type Props = {
  /** Small line of context above the title (e.g. "Day close · Today"). */
  context?: string;
  title: string;
  lines?: string[];
  /** The one button. Rust unless `quiet`. */
  action?: string | null;
  quiet?: boolean;
  onAction?: () => void;
  /** Whole card opens this (when there is no button, or as well). */
  onPress?: () => void;
  children?: ReactNode;
};

/**
 * The single decision or action at the top of Today and Shift: a flat tone
 * block, square, with at most one button. Nothing else on the page has one.
 */
export function HeroCard({
  context,
  title,
  lines = [],
  action,
  quiet = false,
  onAction,
  onPress,
  children,
}: Props) {
  const { colors } = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? colors.background.subtle
            : colors.background.surface,
        },
      ]}>
      {context ? (
        <AppText variant='bodySmall' color='secondary'>
          {context}
        </AppText>
      ) : null}
      <AppText variant='h5'>{title}</AppText>
      {lines.map((l) => (
        <AppText key={l} variant='body'>
          {l}
        </AppText>
      ))}
      {children}
      {action && onAction ? (
        <AppButton
          variant={quiet ? 'tertiary' : 'brand'}
          size='lg'
          fullWidth
          onPress={onAction}
          style={styles.button}>
          {action}
        </AppButton>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing[5], gap: spacing[2] },
  button: { marginTop: spacing[3] },
});
