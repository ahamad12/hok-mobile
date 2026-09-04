import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/contexts/ColorContext';
import { createStyleSheet, useAppStyles } from '@/hooks/useAppStyles';
import { borderRadius, shadows, spacing } from '@/theme/Common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PILL_HEIGHT = 56;
const TAB_ITEM_WIDTH = 60;
const BOTTOM_GAP = spacing[2];
const PILL_INSET = spacing[1];

const SPRING = { damping: 22, stiffness: 280, mass: 0.8 } as const;

export const FLOATING_TAB_CONTENT_INSET = PILL_HEIGHT + BOTTOM_GAP + spacing[2];

interface TabItemProps {
  icon: React.ReactNode;
  label?: string;
  isActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ icon, label, isActive, onPress, onLongPress }: TabItemProps & { label?: string }) {
  const scale = useSharedValue(1);
  const iconLift = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      iconLift.value = withSpring(-2, { damping: 10, stiffness: 300 }, () => {
        iconLift.value = withSpring(0, { damping: 10, stiffness: 300 });
      });
    }
  }, [isActive, iconLift]);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.88, { damping: 14, stiffness: 380 });
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 380 });
  }, [scale]);

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: iconLift.value }],
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
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}>
      {icon}
    </AnimatedPressable>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const dynamicStyles = useAppStyles(barStyles);
  const { colors } = useColors();

  const [barWidth, setBarWidth] = useState(0);
  const tabCount = state.routes.length;

  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);

  useEffect(() => {
    if (barWidth > 0) {
      const tabW = barWidth / tabCount;
      pillX.value = withSpring(state.index * tabW + PILL_INSET, SPRING);
      pillW.value = tabW - PILL_INSET * 2;
    }
  }, [state.index, barWidth, tabCount, pillX, pillW]);

  const animatedPill = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
  }));

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    // Full-width transparent wrapper for centering — taps pass through the gap
    <View
      style={[styles.wrapper, { bottom: insets.bottom + BOTTOM_GAP }]}
      pointerEvents='box-none'>
      <View
        style={[styles.bar, dynamicStyles.bar]}
        onLayout={handleLayout}
        pointerEvents='auto'>
        {barWidth > 0 && (
          <Animated.View
            style={[styles.pill, dynamicStyles.pill, animatedPill]}
          />
        )}

        {state.routes.map(
          (route: (typeof state.routes)[number], index: number) => {
            const { options } = descriptors[route.key];
            const isActive = state.index === index;

            const iconColor = isActive
              ? colors.text.inverse
              : colors.icon.tertiary;
            const icon = options.tabBarIcon?.({
              focused: isActive,
              color: iconColor,
              size: 22,
            });

            return (
              <TabItem
                key={route.key}
                icon={icon}
                label={options.tabBarAccessibilityLabel ?? route.name}
                isActive={isActive}
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
          },
        )}
      </View>
    </View>
  );
}

const barStyles = createStyleSheet((colors) => ({
  bar: {
    backgroundColor: colors.background.surface,
    shadowColor: colors.background.inverse,
    borderColor: colors.border.subtle,
  },
  pill: {
    backgroundColor: colors.brand.primary,
  },
}));

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    height: PILL_HEIGHT,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows['2xl'],
  },
  pill: {
    position: 'absolute',
    top: PILL_INSET,
    bottom: PILL_INSET,
    left: 0,
    borderRadius: borderRadius.full,
  },
  tabItem: {
    width: TAB_ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});