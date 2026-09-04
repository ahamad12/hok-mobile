import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { borderRadius, ButtonSize } from '@/theme/Common';

import { AppIcon, AppIconProps } from './AppIcon';
import { AppText } from './AppText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 15, stiffness: 400, mass: 0.8 } as const;

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'success'
    | 'warning';
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  rounded?: boolean | keyof typeof borderRadius;
  iconLeft?: AppIconProps['name'];
  iconRight?: AppIconProps['name'];
  iconSize?: number;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  haptic?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  rounded = false,
  iconLeft,
  iconRight,
  iconSize,
  fullWidth = false,
  style,
  textStyle,
  children,
  haptic = true,
  onPress,
  ...props
}) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : pressOpacity.value,
  }));

  const buttonStyle: ViewStyle = useMemo(() => {
    const baseStyle = theme.getButtonStyle(
      variant === 'outline' ||
        variant === 'ghost' ||
        variant === 'destructive' ||
        variant === 'success' ||
        variant === 'warning'
        ? 'tertiary'
        : variant,
      size,
    );

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled
          ? theme.colors.button.primary.disabled
          : isPressed
            ? theme.colors.button.primary.pressed
            : theme.colors.button.primary.default,
      },
      secondary: {
        backgroundColor: disabled
          ? theme.colors.button.secondary.disabled
          : isPressed
            ? theme.colors.button.secondary.pressed
            : theme.colors.button.secondary.default,
        borderWidth: 2,
        borderColor: disabled
          ? theme.colors.button.secondary.disabled
          : theme.colors.button.secondary.border,
      },
      tertiary: {
        backgroundColor: disabled
          ? theme.colors.button.tertiary.disabled
          : isPressed
            ? theme.colors.button.tertiary.pressed
            : theme.colors.button.tertiary.default,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled
          ? theme.colors.border.disabled
          : isPressed
            ? theme.colors.border.focus
            : theme.colors.border.default,
      },
      ghost: {
        backgroundColor: isPressed
          ? theme.colors.background.overlay
          : 'transparent',
      },
      destructive: {
        backgroundColor: disabled
          ? theme.colors.button.destructive.disabled
          : isPressed
            ? theme.colors.button.destructive.pressed
            : theme.colors.button.destructive.default,
      },
      success: {
        backgroundColor: disabled
          ? theme.colors.button.success.disabled
          : isPressed
            ? theme.colors.button.success.pressed
            : theme.colors.button.success.default,
      },
      warning: {
        backgroundColor: disabled
          ? theme.colors.button.warning.disabled
          : isPressed
            ? theme.colors.button.warning.pressed
            : theme.colors.button.warning.default,
      },
    };

    const getRoundedRadius = (): number => {
      if (rounded === false) {
        const br = baseStyle.borderRadius;
        return typeof br === 'number' ? br : 0;
      }
      if (rounded === true) {
        return borderRadius.full;
      }
      return borderRadius[rounded as keyof typeof borderRadius];
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      borderRadius: getRoundedRadius(),
      ...(fullWidth && { width: '100%' }),
    };
  }, [theme, variant, size, disabled, isPressed, fullWidth, rounded]);

  const textColor = useMemo(() => {
    if (disabled) {
      return theme.colors.text.disabled;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.text.inverse;
      case 'secondary':
        return theme.colors.brand.primary;
      case 'tertiary':
        return theme.colors.text.primary;
      case 'outline':
      case 'ghost':
        return theme.colors.text.primary;
      case 'destructive':
        return theme.colors.text.inverse;
      case 'success':
        return theme.colors.text.inverse;
      case 'warning':
        return theme.colors.text.inverse;
      default:
        return theme.colors.text.inverse;
    }
  }, [theme, variant, disabled]);

  const defaultIconSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return theme.iconSize.sm;
      case 'lg':
        return theme.iconSize.md;
      default:
        return theme.iconSize.base;
    }
  }, [theme, size]);

  const iconLeftStyle = useMemo(
    () => ({
      marginRight: children ? theme.spacing[2] : 0,
    }),
    [children, theme],
  );

  const iconRightStyle = useMemo(
    () => ({
      marginLeft: children ? theme.spacing[2] : 0,
    }),
    [children, theme],
  );

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && !loading && onPress) {
      onPress(event);
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.97, SPRING);
    pressOpacity.value = withTiming(0.88, { duration: 80 });
    if (haptic) {
      // guarded haptics - expo-haptics is optional
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {
        // haptics not available
      }
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1, SPRING);
    pressOpacity.value = withTiming(1, { duration: 120 });
  };

  return (
    <AnimatedPressable
      style={[buttonStyle, style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole='button'
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      <View
        style={{ opacity: loading ? 0 : 1, flexDirection: 'row', alignItems: 'center' }}
      >
        {iconLeft && (
          <AppIcon
            name={iconLeft}
            size={iconSize || defaultIconSize}
            color={textColor}
            style={iconLeftStyle}
          />
        )}
        {children && (
          <AppText
            variant={
              size === 'sm'
                ? 'buttonSmall'
                : size === 'lg'
                  ? 'buttonLarge'
                  : 'button'
            }
            customColor={textColor}
            style={textStyle}
          >
            {children}
          </AppText>
        )}
        {iconRight && (
          <AppIcon
            name={iconRight}
            size={iconSize || defaultIconSize}
            color={textColor}
            style={iconRightStyle}
          />
        )}
      </View>
      {loading && (
        <ActivityIndicator
          color={textColor}
          style={StyleSheet.absoluteFill}
        />
      )}
    </AnimatedPressable>
  );
};
