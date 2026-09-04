import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStyles } from '@/hooks/useAppStyles';
import { useHideToast, useToastState } from '@/store/selectors/toastSelectors';
import { ToastVariant } from '@/store/slices/toastSlice';
import { ColorPallete } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { Column } from './Column';
import { Row } from './Row';

const DEFAULT_DURATION = 3500;
// Error needs more read time than a routine success confirmation.
const VARIANT_DURATIONS: Partial<Record<ToastVariant, number>> = {
  success: 2500,
  error: 5000,
  warning: 4000,
  info: 3500,
};

const ANIM_MS = 260;
const SWIPE_THRESHOLD = -36;
const ICON_SIZE = 26;
const DISMISS_BTN_SIZE = 32;

const SLIDE_SPRING = { damping: 16, stiffness: 200, mass: 0.8 } as const;
const ICON_SPRING = { damping: 12, stiffness: 180, mass: 0.7 } as const;
const RELEASE_ICON_SPRING = { damping: 10, stiffness: 180, mass: 0.6 } as const;
const RELEASE_SWIPE_SPRING = { damping: 22, stiffness: 320 } as const;

const VARIANT_ICONS: Record<
  Exclude<ToastVariant, 'loading'>,
  Parameters<typeof AppIcon>[0]['name']
> = {
  success: 'CircleCheck',
  error: 'CircleX',
  warning: 'TriangleAlert',
  info: 'Info',
};

const buildToastColors = (colors: ColorPallete) => ({
  cardBgStyle: { backgroundColor: colors.background.surface },
  iconBgStyle: { backgroundColor: colors.background.subtle },
  dismissBgStyle: { backgroundColor: colors.background.subtle },
  dismissIconColor: colors.icon.tertiary,
  loadingBorderBg: colors.border.default,
  successBorderBg: colors.border.success,
  errorBorderBg: colors.border.error,
  warningBorderBg: colors.border.warning,
  infoBorderBg: colors.border.info,
  successIconColor: colors.icon.success,
  errorIconColor: colors.icon.error,
  warningIconColor: colors.icon.warning,
  infoIconColor: colors.icon.info,
  loadingIconColor: colors.brand.primary,
  shimmerStart: colors.brand.accent,
  shimmerEnd: colors.brand.primary,
  shadowColor: colors.background.inverse,
});

type ToastColors = ReturnType<typeof buildToastColors>;

const getVariantColors = (variant: ToastVariant, c: ToastColors) => {
  const variantMap: Record<Exclude<ToastVariant, 'loading'>, string> = {
    success: c.successIconColor,
    error: c.errorIconColor,
    warning: c.warningIconColor,
    info: c.infoIconColor,
  };

  const borderMap: Record<ToastVariant, string> = {
    success: c.successBorderBg,
    error: c.errorBorderBg,
    warning: c.warningBorderBg,
    info: c.infoBorderBg,
    loading: c.loadingBorderBg,
  };

  return {
    iconColor:
      variant === 'loading'
        ? c.loadingIconColor
        : variantMap[variant as Exclude<ToastVariant, 'loading'>],
    borderBg: borderMap[variant],
  };
};

export const AppToast: React.FC = () => {
  const toast = useToastState();
  const hideToast = useHideToast();
  const insets = useSafeAreaInsets();

  // All motion now lives on Reanimated shared values (UI thread) instead
  // of mixing RN Animated.Value with the rest of the kit, which used to
  // force the shimmer onto the JS thread (useNativeDriver: false) and
  // could jank on low-end Android while the JS thread was busy.
  const translateY = useSharedValue(-140);
  const swipeY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const closeButtonRotation = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const shimmerX = useSharedValue(-1);
  const shimmerWidth = useSharedValue(0.6);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDismissed = useRef(false);
  const prevVariantRef = useRef<string | null>(null);
  const [frozenToast, setFrozenToast] = useState<typeof toast>(null);

  const toastColors = useAppStyles(buildToastColors);

  const slideIn = useCallback(
    (variant?: string) => {
      isDismissed.current = false;
      cancelAnimation(shimmerX);

      swipeY.value = 0;
      closeButtonRotation.value = 0;
      iconScale.value = 0;
      shimmerX.value = -1;
      shimmerWidth.value = 0.6;

      translateY.value = withSpring(0, SLIDE_SPRING);
      opacity.value = withTiming(1, { duration: ANIM_MS });
      iconScale.value = withSpring(1, ICON_SPRING, (finished) => {
        'worklet';
        if (finished && variant === 'loading') {
          shimmerX.value = -1;
          shimmerX.value = withRepeat(
            withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
            -1,
            false,
          );
        }
      });
    },
    [closeButtonRotation, iconScale, opacity, shimmerWidth, shimmerX, swipeY, translateY],
  );

  const slideOut = useCallback(
    (onDone?: () => void) => {
      if (isDismissed.current) return;
      isDismissed.current = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimation(shimmerX);

      translateY.value = withTiming(-140, { duration: ANIM_MS }, (finished) => {
        'worklet';
        if (finished && onDone) runOnJS(onDone)();
      });
      opacity.value = withTiming(0, { duration: ANIM_MS });
      closeButtonRotation.value = withTiming(90, { duration: ANIM_MS });
      iconScale.value = withTiming(0, { duration: ANIM_MS });
    },
    [closeButtonRotation, iconScale, opacity, shimmerX, translateY],
  );

  const dismissLoading = useCallback(
    (onDone?: () => void) => {
      if (isDismissed.current) return;
      isDismissed.current = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimation(shimmerX);

      shimmerX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      shimmerWidth.value = withTiming(
        1,
        { duration: 300, easing: Easing.out(Easing.cubic) },
        (finished) => {
          'worklet';
          if (!finished) return;
          translateY.value = withDelay(
            300,
            withTiming(-140, { duration: ANIM_MS }, (done) => {
              'worklet';
              if (done && onDone) runOnJS(onDone)();
            }),
          );
          opacity.value = withDelay(300, withTiming(0, { duration: ANIM_MS }));
        },
      );
    },
    [opacity, shimmerWidth, shimmerX, translateY],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (
        _e: GestureResponderEvent,
        gs: PanResponderGestureState,
      ) => Math.abs(gs.dy) > 5,

      onPanResponderMove: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dy < 0) {
          swipeY.value = gs.dy;
          opacity.value = Math.max(0, 1 + gs.dy / 70);
          closeButtonRotation.value = Math.max(0, (gs.dy / -36) * 90);
          iconScale.value = Math.max(0.7, 1 + gs.dy / 90);
        }
      },

      onPanResponderRelease: (_e: GestureResponderEvent, gs: PanResponderGestureState) => {
        if (gs.dy < SWIPE_THRESHOLD || gs.vy < -0.6) {
          if (timerRef.current) clearTimeout(timerRef.current);

          swipeY.value = withTiming(-160, { duration: 200 });
          opacity.value = withTiming(0, { duration: 200 });
          closeButtonRotation.value = withTiming(90, { duration: 200 });
          iconScale.value = withTiming(0, { duration: 200 }, (finished) => {
            'worklet';
            if (finished) {
              isDismissed.current = true;
              runOnJS(hideToast)();
            }
          });
        } else {
          swipeY.value = withSpring(0, RELEASE_SWIPE_SPRING);
          opacity.value = withTiming(1, { duration: 140 });
          closeButtonRotation.value = withTiming(0, { duration: 140 });
          iconScale.value = withSpring(1, RELEASE_ICON_SPRING);
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (!toast) {
      if (prevVariantRef.current === 'loading' && frozenToast) {
        // The store's toast is already null here — calling hideToast()
        // again (as the previous version did) was a redundant second
        // state write for the same transition. Just clear the local
        // frozen copy once the exit animation finishes.
        dismissLoading(() => setFrozenToast(null));
      } else {
        setFrozenToast(null);
      }
      prevVariantRef.current = null;
      return undefined;
    }

    // If the previous toast was 'loading' and we landed here without ever
    // passing through the `!toast` branch above, the store replaced the
    // loading toast in-place with its result (see toastSlice). Doing a
    // full slide-out/slide-in reset in that case snaps the card to -140
    // for a frame, which reads as a glitch — a quick icon pulse instead
    // keeps the card in place and just swaps its content.
    const wasReplacingLoading = prevVariantRef.current === 'loading';

    setFrozenToast(toast);
    isDismissed.current = false;

    const variant = toast.variant ?? 'info';
    prevVariantRef.current = variant;

    if (wasReplacingLoading) {
      cancelAnimation(shimmerX);
      iconScale.value = 0.6;
      iconScale.value = withSpring(1, ICON_SPRING);
    } else {
      translateY.value = -140;
      swipeY.value = 0;
      opacity.value = 0;
      slideIn(variant);
    }

    const duration =
      variant === 'loading' ? 0 : (toast.duration ?? VARIANT_DURATIONS[variant] ?? DEFAULT_DURATION);

    if (duration > 0) {
      timerRef.current = setTimeout(() => slideOut(hideToast), duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimation(shimmerX);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + swipeY.value }],
    opacity: opacity.value,
  }));

  const activeToast = toast ?? frozenToast;

  if (!activeToast) return null;

  const variant = activeToast.variant ?? 'info';
  const variantColors = getVariantColors(variant, toastColors);
  const panHandlers = variant === 'loading' ? {} : panResponder.panHandlers;
  const isLoading = variant === 'loading';

  return (
    <Animated.View
      {...panHandlers}
      renderToHardwareTextureAndroid
      needsOffscreenAlphaCompositing
      collapsable={false}
      // A toast is a live status update, not a modal — announce it to
      // screen readers without stealing focus the way an alert dialog
      // would.
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      importantForAccessibility="yes"
      style={[
        styles.wrapper,
        { top: insets.top + spacing[3] },
        wrapperAnimatedStyle,
      ]}>
      <View style={[styles.borderContainer, { backgroundColor: variantColors.borderBg }]}>
        {isLoading && (
          <LoadingShimmer shimmerX={shimmerX} shimmerWidth={shimmerWidth} colors={toastColors} />
        )}

        <Pressable
          onPress={() => !isLoading && slideOut(hideToast)}
          disabled={isLoading}
          style={{ flex: 1 }}>
          <Row
            align="center"
            gap={spacing[1]}
            style={[
              styles.card,
              isLoading && styles.loadingCard,
              toastColors.cardBgStyle,
              { shadowColor: toastColors.shadowColor },
            ]}>
            <ToastIcon
              icon={activeToast.icon}
              variant={variant}
              iconColor={variantColors.iconColor}
              iconBgStyle={toastColors.iconBgStyle}
              iconScale={iconScale}
            />

            <Column flex={1}>
              {activeToast.title && (
                <AppText variant="label" weight="semibold" numberOfLines={1}>
                  {activeToast.title}
                </AppText>
              )}
              <AppText variant="bodySmall" color="secondary" numberOfLines={2}>
                {activeToast.message}
              </AppText>
            </Column>

            {!isLoading && (
              <DismissButton
                closeButtonRotation={closeButtonRotation}
                dismissBgStyle={toastColors.dismissBgStyle}
                dismissIconColor={toastColors.dismissIconColor}
                onDismiss={() => slideOut(hideToast)}
              />
            )}
          </Row>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const LoadingShimmer: React.FC<{
  shimmerX: SharedValue<number>;
  shimmerWidth: SharedValue<number>;
  colors: ToastColors;
}> = ({ shimmerX, shimmerWidth, colors }) => {
  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(shimmerWidth.value, [0, 2], [0, 200])}%`,
    transform: [{ translateX: interpolate(shimmerX.value, [-1, 1], [-340, 340]) }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.shimmerOverlay, shimmerAnimatedStyle]}>
      <LinearGradient
        colors={['transparent', colors.shimmerStart, colors.shimmerEnd, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBeam}
      />
    </Animated.View>
  );
};

const ToastIcon: React.FC<{
  icon: unknown;
  variant: ToastVariant;
  iconColor: string;
  iconBgStyle: ViewStyle;
  iconScale: SharedValue<number>;
}> = ({ icon, variant, iconColor, iconBgStyle, iconScale }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Animated.View style={[styles.iconWrap, iconBgStyle, animatedStyle]}>
      {icon && typeof icon === 'string' ? (
        <AppIcon
          name={icon as Parameters<typeof AppIcon>[0]['name']}
          size={ICON_SIZE}
          color={iconColor}
          strokeWidth={2.2}
        />
      ) : icon ? (
        (icon as React.ReactNode)
      ) : (
        <AppIcon
          name={VARIANT_ICONS[variant as Exclude<ToastVariant, 'loading'>]}
          size={ICON_SIZE}
          color={iconColor}
          strokeWidth={2.2}
        />
      )}
    </Animated.View>
  );
};

const DismissButton: React.FC<{
  closeButtonRotation: SharedValue<number>;
  dismissBgStyle: ViewStyle;
  dismissIconColor: string;
  onDismiss: () => void;
}> = ({ closeButtonRotation, dismissBgStyle, dismissIconColor, onDismiss }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${closeButtonRotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onDismiss}
        style={({ pressed }) => [
          styles.dismissBtn,
          dismissBgStyle,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification">
        <AppIcon name="X" size={18} color={dismissIconColor} strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 1700,
    borderRadius: 18,
    overflow: 'hidden',
  },
  borderContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    padding: 1.5,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  gradientBeam: {
    flex: 1,
  },
  card: {
    borderRadius: 16.5,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingCard: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dismissBtn: {
    width: DISMISS_BTN_SIZE,
    height: DISMISS_BTN_SIZE,
    borderRadius: DISMISS_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
