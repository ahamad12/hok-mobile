import { Moon, Sun } from 'lucide'; // vanilla data package — NOT lucide-react-native
// morphicons consumes icon geometry (IconNode), not rendered components,
// so this is a separate dependency from the lucide-react-native your
// AppIcon component already uses. Both coexist fine — AppIcon keeps
// rendering static icons everywhere else; this is the one spot that morphs.
import { MorphIcon } from 'morphicons/react-native';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLOR_THEME } from '@/constants';
import { useColors } from '@/contexts/ColorContext';
import { useStore } from '@/store';
import { useSelectedTheme } from '@/store/selectors/appSelectors';
import { borderRadius } from '@/theme/Common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { damping: 16, stiffness: 380, mass: 0.7 } as const;
const COLOR_SPRING = { damping: 18, stiffness: 220 } as const;

const SIZES = {
  sm: { box: 32, icon: 16 },
  base: { box: 40, icon: 18 },
} as const;

export interface ThemeToggleProps {
  /**
   * Controlled mode — pass `value`/`onValueChange` to drive this from
   * your own state instead of the app's theme store (handy for a
   * showcase screen, or a settings row that previews before committing).
   * Omit both to read/write the store directly.
   */
  value?: boolean;
  onValueChange?: (isDark: boolean) => void;
  size?: keyof typeof SIZES;
  style?: ViewStyle;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  value,
  onValueChange,
  size = 'base',
  style,
}) => {
  const { colors } = useColors();
  const selectedTheme = useSelectedTheme();

  const setColorTheme = useStore((s) => s.setColorTheme);

  const isControlled = value !== undefined;
  const isDark = isControlled ? value : selectedTheme === COLOR_THEME.DARK;

  const dim = SIZES[size];
  const press = useSharedValue(1);
  const colorProgress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    colorProgress.value = withSpring(isDark ? 1 : 0, COLOR_SPRING);
  }, [isDark, colorProgress]);

  const handleToggle = useCallback(() => {
    const next = !isDark;
    if (isControlled) {
      onValueChange?.(next);
    } else {
      setColorTheme(next ? COLOR_THEME.DARK : COLOR_THEME.LIGHT);
    }
  }, [isDark, isControlled, onValueChange, setColorTheme]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [colors.background.subtle, colors.background.inverse],
    ),
  }));

  // Icon sits on an inverse-tinted circle once dark mode is active, so the
  // moon reads as "lit" against a dark chip rather than just recoloring
  // in place — matches the way AppToggle's track recolors on state change.
  const iconColor = isDark ? colors.icon.inverse : colors.icon.primary;

  return (
    <AnimatedPressable
      onPress={handleToggle}
      onPressIn={() => {
        press.value = withSpring(0.88, PRESS_SPRING);
      }}
      onPressOut={() => {
        press.value = withSpring(1, PRESS_SPRING);
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      hitSlop={8}
      style={[
        styles.box,
        { width: dim.box, height: dim.box, borderRadius: borderRadius.full },
        containerStyle,
        style,
      ]}>
      <MorphIcon
        icon={isDark ? Moon : Sun}
        size={dim.icon}
        color={iconColor}
        strokeWidth={2}
        spring="snappy"
      />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
