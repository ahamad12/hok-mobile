import { BottomTabBarProps } from 'expo-router/tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, shadows, spacing } from '@/theme/Common';

import { AppText } from './AppText';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BAR_HEIGHT = 64;
const BOTTOM_GAP = spacing[2];
const SIDE_GAP = spacing[4];
const PILL_INSET = spacing[1] + 2;

const SPRING = { damping: 22, stiffness: 280, mass: 0.8 } as const;

/** Bottom padding a tab screen needs so content clears the bar. */
export const FLOATING_TAB_CONTENT_INSET = BAR_HEIGHT + BOTTOM_GAP + spacing[4];

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  isActive: boolean;
  badge?: string | number;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({
  icon,
  label,
  color,
  isActive,
  badge,
  onPress,
  onLongPress,
}: TabItemProps) {
  const { colors } = useColors();
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 14, stiffness: 380 });
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 380 });
  }, [scale]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.tabItem, animatedScale]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8 }}
      accessibilityRole='tab'
      accessibilityLabel={
        badge !== undefined ? `${label}, ${badge} need attention` : label
      }
      accessibilityState={{ selected: isActive }}>
      <View>
        {icon}
        {badge !== undefined ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.background.error },
            ]}>
            <AppText
              variant='caption'
              customColor={colors.text.white}
              maxFontSizeMultiplier={1}
              style={styles.badgeText}>
              {typeof badge === 'number' && badge > 99 ? '99+' : String(badge)}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText
        variant='caption'
        weight={isActive ? 'semibold' : 'medium'}
        customColor={color}
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
        style={styles.label}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useColors();

  // Only routes that declare a tab icon are real tabs; pushed screens
  // registered with `href: null` have none.
  const visible = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => {
      const { options } = descriptors[route.key];
      return typeof options.tabBarIcon === 'function';
    });

  const activeVisibleIndex = Math.max(
    0,
    visible.findIndex(({ index }) => index === state.index),
  );
  const isOnTab = visible.some(({ index }) => index === state.index);

  const [barWidth, setBarWidth] = useState(0);
  const tabCount = Math.max(visible.length, 1);
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);

  useEffect(() => {
    if (barWidth > 0) {
      const tabW = barWidth / tabCount;
      pillX.value = withSpring(activeVisibleIndex * tabW + PILL_INSET, SPRING);
      pillW.value = tabW - PILL_INSET * 2;
    }
  }, [activeVisibleIndex, barWidth, tabCount, pillX, pillW]);

  const animatedPill = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
  }));

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + BOTTOM_GAP }]}
      pointerEvents='box-none'>
      <View
        accessibilityRole='tablist'
        style={[
          styles.bar,
          {
            backgroundColor: colors.isDark
              ? colors.background.surface
              : colors.background.default,
          },
        ]}
        onLayout={handleLayout}>
        {barWidth > 0 && isOnTab ? (
          <Animated.View
            style={[
              styles.pill,
              {
                backgroundColor: colors.isDark
                  ? colors.background.subtle
                  : colors.background.surface,
              },
              animatedPill,
            ]}
          />
        ) : null}

        {visible.map(({ route, index }) => {
          const { options } = descriptors[route.key];
          const isActive = state.index === index;
          const color = isActive ? colors.brand.primary : colors.icon.tertiary;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options.title ?? route.name);

          return (
            <TabItem
              key={route.key}
              icon={options.tabBarIcon?.({
                focused: isActive,
                color,
                size: 22,
              })}
              label={label}
              color={color}
              isActive={isActive}
              badge={options.tabBarBadge}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SIDE_GAP,
    right: SIDE_GAP,
  },
  bar: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    borderRadius: borderRadius.full,
    ...shadows.soft,
  },
  pill: {
    position: 'absolute',
    top: PILL_INSET,
    bottom: PILL_INSET,
    left: 0,
    borderRadius: borderRadius.full,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    zIndex: 1,
  },
  label: { fontSize: 11, lineHeight: 14 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12, fontWeight: '700' },
});

/** Bottom padding for scroll content on a tab screen (bar + safe area). */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + FLOATING_TAB_CONTENT_INSET;
}
