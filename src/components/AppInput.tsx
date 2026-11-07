import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BlurEvent,
  FocusEvent,
  Pressable,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { InputSize } from '@/theme/Common';
import { familyFor } from '@/theme/fontState';

import { AppIcon, AppIconProps } from './AppIcon';
import { AppText } from './AppText';
import { AppView } from './AppView';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AppInputProps extends TextInputProps {
  label?: string;
  size?: InputSize;
  error?: string;
  helperText?: string;
  iconLeft?: AppIconProps['name'];
  iconRight?: AppIconProps['name'];
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  wrapperStyle?: ViewStyle;
  showPasswordToggle?: boolean;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      size = 'base',
      error,
      helperText,
      iconLeft,
      iconRight,
      required = false,
      disabled = false,
      containerStyle,
      wrapperStyle,
      style,
      onFocus,
      onBlur,
      secureTextEntry,
      showPasswordToggle,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const internalRef = useRef<TextInput>(null);

    const glowAnim = useSharedValue(0);
    const shakeX = useSharedValue(0);
    const prevError = useRef<string | undefined>(undefined);

    useEffect(() => {
      if (error && error !== prevError.current) {
        shakeX.value = withSequence(
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-4, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
      }
      prevError.current = error;
    }, [error, shakeX]);

    const shakeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shakeX.value }],
    }));

    const mergedRef = useCallback(
      (node: TextInput | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.RefObject<TextInput | null>).current = node;
        }
      },
      [ref],
    );

    const isPassword = secureTextEntry || showPasswordToggle;

    const inputWrapperStyle: ViewStyle = useMemo(() => {
      const baseStyle = theme.getInputStyle(size, !!error);

      return {
        ...baseStyle,
        flexDirection: 'row',
        alignItems: 'center',
        // Borderless: state is shown by the fill, not a stroke.
        borderWidth: 0,
        backgroundColor: error
          ? theme.colors.background.errorSubtle
          : disabled
            ? theme.colors.background.disabled
            : isFocused
              ? theme.colors.background.subtle
              : theme.colors.background.surface,
        opacity: disabled ? theme.opacity[60] : theme.opacity[100],
      };
    }, [theme, size, error, isFocused, disabled]);

    const shadowBaseStyle: ViewStyle = useMemo(
      () => ({
        shadowColor: error
          ? theme.colors.border.error
          : theme.colors.brand.primary,
        shadowOffset: { width: 0, height: 0 },
      }),
      [theme, error],
    );

    // No glow in the borderless system; kept as a no-op animated style.
    const animatedGlowStyle = useAnimatedStyle(() => ({
      shadowOpacity: glowAnim.value * 0,
    }));

    const inputTextStyle = useMemo(() => {
      return {
        flex: 1,
        color: disabled
          ? theme.colors.text.disabled
          : theme.colors.text.primary,
        fontSize: theme.fontSize.base,
        ...(familyFor('500')
          ? { fontFamily: familyFor('500') }
          : { fontWeight: theme.fontWeight.medium }),
        padding: 0,
      };
    }, [theme, disabled]);

    const iconColor = useMemo(() => {
      if (error) return theme.colors.status.error;
      if (disabled) return theme.colors.text.disabled;
      if (isFocused) return theme.colors.text.primary;
      return theme.colors.text.tertiary;
    }, [theme, error, disabled, isFocused]);

    const handleFocus = (e: FocusEvent) => {
      setIsFocused(true);
      glowAnim.value = withTiming(1, { duration: 200 });
      onFocus?.(e);
    };

    const handleBlur = (e: BlurEvent) => {
      setIsFocused(false);
      glowAnim.value = withTiming(0, { duration: 150 });
      onBlur?.(e);
    };

    return (
      <AppView style={containerStyle}>
        {label && (
          <AppView mb={2} row align='center'>
            <AppText variant='label' color='secondary'>
              {label}
            </AppText>
            {required && (
              <AppText variant='label' customColor={theme.colors.status.error}>
                {' '}
                *
              </AppText>
            )}
          </AppView>
        )}

        <Animated.View style={shakeStyle}>
          <AnimatedPressable
            onPress={() => !disabled && internalRef.current?.focus()}
            style={[
              inputWrapperStyle,
              shadowBaseStyle,
              animatedGlowStyle,
              wrapperStyle,
            ]}>
            {iconLeft && (
              <AppIcon
                name={iconLeft}
                size={theme.iconSize.sm}
                color={iconColor}
                style={{ marginRight: theme.spacing[3] }}
              />
            )}

            <TextInput
              ref={mergedRef}
              style={[inputTextStyle, style]}
              placeholderTextColor={theme.colors.text.tertiary}
              editable={!disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              accessibilityLabel={label}
              accessibilityState={{ disabled }}
              maxFontSizeMultiplier={1.5}
              allowFontScaling={true}
              secureTextEntry={isPassword && !isPasswordVisible}
              {...props}
            />

            {isPassword ? (
              <Pressable
                onPress={() => setIsPasswordVisible((v) => !v)}
                hitSlop={8}
                accessibilityRole='button'
                accessibilityLabel={
                  isPasswordVisible ? 'Hide password' : 'Show password'
                }
                style={{ marginLeft: theme.spacing[2] }}>
                <AppIcon
                  name={isPasswordVisible ? 'EyeOff' : 'Eye'}
                  size={theme.iconSize.sm}
                  color={iconColor}
                  strokeWidth={1.75}
                />
              </Pressable>
            ) : (
              iconRight && (
                <AppIcon
                  name={iconRight}
                  size={theme.iconSize.base}
                  color={iconColor}
                  style={{ marginLeft: theme.spacing[2] }}
                />
              )
            )}
          </AnimatedPressable>
        </Animated.View>

        {(error || helperText) && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={{ marginTop: theme.spacing[1] }}>
            <AppText
              variant='caption'
              customColor={
                error ? theme.colors.status.error : theme.colors.text.tertiary
              }>
              {error || helperText}
            </AppText>
          </Animated.View>
        )}
      </AppView>
    );
  },
);
