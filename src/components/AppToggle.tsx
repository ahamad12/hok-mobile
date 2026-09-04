import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius } from '@/theme/Common';

const SPRING = { damping: 18, stiffness: 400, mass: 0.8 } as const;

const SIZES = {
  sm: { trackWidth: 40, trackHeight: 22, thumb: 16 },
  base: { trackWidth: 52, trackHeight: 28, thumb: 22 },
} as const;

const PADDING = 3;

export interface AppToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'base';
}

export const AppToggle: React.FC<AppToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'base',
}) => {
  const { colors } = useColors();
  const progress = useSharedValue(value ? 1 : 0);
  const pressScale = useSharedValue(1);
  const dim = SIZES[size];
  const offX = PADDING;
  const onX = dim.trackWidth - dim.thumb - PADDING;

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, SPRING);
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.background.subtle, colors.brand.primary],
    ),
    opacity: disabled ? 0.5 : 1,
    transform: [{ scale: pressScale.value }],
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offX + progress.value * (onX - offX) },
      { scaleX: 1 + (1 - pressScale.value) * 1.6 },
    ],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      onPressIn={() => {
        pressScale.value = withSpring(0.94, { damping: 20, stiffness: 500 });
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 20, stiffness: 500 });
      }}
      accessibilityRole='switch'
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}>
      <Animated.View
        style={[
          styles.track,
          { width: dim.trackWidth, height: dim.trackHeight },
          trackStyle,
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            { width: dim.thumb, height: dim.thumb },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
});
