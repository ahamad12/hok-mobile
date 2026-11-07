/* eslint-disable security/detect-object-injection */
import { useMemo } from 'react';
import { TextStyle, ViewStyle } from 'react-native';

import { useColors } from '@/contexts';
import {
  borderRadius,
  buttonSize,
  duration,
  fontSize,
  fontWeight,
  iconSize,
  inputSize,
  letterSpacing,
  lineHeight,
  opacity,
  shadows,
  spacing,
  typography,
  zIndex,
} from '@/theme/Common';

/**
 * Comprehensive theme hook that provides all design tokens and styling utilities
 * @example
 * const theme = useTheme();
 *
 * // Use design tokens
 * const styles = { padding: theme.spacing[4], fontSize: theme.fontSize.lg };
 *
 * // Use styling functions
 * const headingStyle = theme.getTypography('h1', 'primary');
 * const buttonStyle = theme.getButtonStyle('primary', 'base');
 */
export const useTheme = () => {
  const { colors } = useColors();

  return useMemo(() => {
    // Remove "use" prefix - these are helper functions, not hooks
    const getTypography = (
      variant: keyof typeof typography,
      color?:
        | 'primary'
        | 'secondary'
        | 'tertiary'
        | 'disabled'
        | 'inverse'
        | 'link'
        | 'success'
        | 'error'
        | 'warning'
        | 'info',
    ): TextStyle => {
      const baseStyle = typography[variant];
      const textColor = color ? colors.text[color] : colors.text.primary;
      return {
        ...baseStyle,
        color: textColor,
      };
    };

    const getShadow = (size: keyof typeof shadows): ViewStyle => {
      const shadow = shadows[size];
      return {
        ...shadow,
        shadowColor: colors.text.primary,
      };
    };

    const getButtonStyle = (
      variant: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost',
      size: keyof typeof buttonSize = 'base',
    ): ViewStyle => {
      const sizeStyles = buttonSize[size];
      const variantStyles: Record<string, ViewStyle> = {
        primary: { backgroundColor: colors.button.primary.default },
        secondary: { backgroundColor: colors.button.secondary.default },
        tertiary: { backgroundColor: colors.button.tertiary.default },
        outline: { backgroundColor: colors.background.surface },
        ghost: {
          backgroundColor: 'transparent',
        },
      };

      return {
        ...sizeStyles,
        ...variantStyles[variant],
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      };
    };

    const getInputStyle = (
      size: keyof typeof inputSize = 'base',
      hasError: boolean = false,
    ): ViewStyle => {
      const sizeStyles = inputSize[size];
      return {
        ...sizeStyles,
        backgroundColor: hasError
          ? colors.background.errorSubtle
          : colors.background.surface,
        borderWidth: 0,
      };
    };

    // Borderless cards: a tonal surface, no stroke, no shadow.
    const getCardStyle = (
      variant: 'flat' | 'outlined' | 'elevated' = 'flat',
    ): ViewStyle => ({
      backgroundColor:
        variant === 'elevated'
          ? colors.background.default
          : colors.background.surface,
      borderRadius: borderRadius.xl,
      padding: spacing[4],
      ...(variant === 'elevated' ? getShadow('soft') : {}),
    });

    return {
      // Design tokens
      spacing,
      fontSize,
      fontWeight,
      lineHeight,
      letterSpacing,
      typography,
      borderRadius,
      shadows,
      opacity,
      zIndex,
      duration,
      iconSize,
      buttonSize,
      inputSize,
      colors,

      // Helper functions (renamed from useX to getX)
      getTypography,
      getShadow,
      getButtonStyle,
      getInputStyle,
      getCardStyle,
    };
  }, [colors]);
};
