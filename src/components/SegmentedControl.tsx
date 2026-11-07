import { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, shadows, spacing } from '@/theme/Common';

import { AppText } from './AppText';

const SPRING = { damping: 22, stiffness: 280, mass: 0.8 } as const;
const INSET = 3;

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** Small count shown after the label. */
  count?: number;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors } = useColors();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const segW = width > 0 ? (width - INSET * 2) / options.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * segW, SPRING);
  }, [index, segW, x]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      accessibilityRole='tablist'
      style={[
        styles.track,
        { backgroundColor: colors.background.subtle },
        style,
      ]}>
      {segW > 0 ? (
        <Animated.View
          style={[
            styles.thumb,
            { width: segW, backgroundColor: colors.background.default },
            thumbStyle,
          ]}
        />
      ) : null}
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={styles.segment}
            accessibilityRole='tab'
            accessibilityState={{ selected: active }}
            accessibilityLabel={
              o.count !== undefined ? `${o.label}, ${o.count}` : o.label
            }>
            <AppText
              variant='label'
              weight={active ? 'semibold' : 'medium'}
              customColor={active ? colors.text.primary : colors.text.secondary}
              numberOfLines={1}>
              {o.label}
              {o.count !== undefined ? (
                <AppText
                  variant='label'
                  customColor={
                    active ? colors.brand.primary : colors.text.tertiary
                  }>
                  {`  ${o.count}`}
                </AppText>
              ) : null}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: INSET,
    minHeight: 40,
  },
  thumb: {
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    left: INSET,
    borderRadius: borderRadius.md - 2,
    ...shadows.sm,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
  },
});
