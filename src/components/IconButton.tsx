import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, shadows } from '@/theme/Common';

import { AppIcon, IconName } from './AppIcon';

export interface IconButtonProps {
  icon: IconName;
  /** Accessible name — required because there is no visible text. */
  label: string;
  onPress: () => void;
  /**
   * `surface`: tonal circle (default, for page headers).
   * `solid`: primary-filled circle (main action).
   * `floating`: page-colored circle with a soft shadow (over images).
   */
  variant?: 'surface' | 'solid' | 'floating';
  size?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onPress,
  variant = 'surface',
  size = 44,
  style,
}) => {
  const { colors } = useColors();
  const bg =
    variant === 'solid'
      ? colors.button.primary.default
      : variant === 'floating'
        ? colors.background.default
        : colors.background.surface;
  const pressedBg =
    variant === 'solid'
      ? colors.button.primary.pressed
      : colors.background.subtle;
  const fg = variant === 'solid' ? colors.text.inverse : colors.icon.primary;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole='button'
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.btn,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? pressedBg : bg,
        },
        variant === 'floating' && shadows.soft,
        style,
      ]}>
      <AppIcon name={icon} size={Math.round(size * 0.45)} color={fg} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
