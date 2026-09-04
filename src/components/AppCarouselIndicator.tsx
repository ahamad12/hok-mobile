import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { borderRadius, spacing } from '@/theme/Common';

export interface AppCarouselIndicatorProps {
  totalItems: number;
  currentIndex: number;
  onDotPress?: (index: number) => void;
  style?: ViewStyle;
}

interface DotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress?: () => void;
}

const SPRING = { damping: 18, stiffness: 300 } as const;

function Dot({ isActive, activeColor, inactiveColor, onPress }: DotProps) {
  const width = useSharedValue(isActive ? spacing[6] : spacing[2]);
  const bgOpacity = useSharedValue(isActive ? 1 : 0.4);

  useEffect(() => {
    width.value = withSpring(isActive ? spacing[6] : spacing[2], SPRING);
    bgOpacity.value = withSpring(isActive ? 1 : 0.4, SPRING);
  }, [isActive, width, bgOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: isActive ? activeColor : inactiveColor,
    opacity: bgOpacity.value,
  }));

  return (
    <Pressable onPress={onPress} hitSlop={8} disabled={!onPress}>
      <Animated.View style={[styles.dotBase, animatedStyle]} />
    </Pressable>
  );
}

export const AppCarouselIndicator: React.FC<AppCarouselIndicatorProps> = ({
  totalItems,
  currentIndex,
  onDotPress,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalItems }).map((_, index) => (
        <Dot
          key={index}
          isActive={index === currentIndex}
          activeColor={theme.colors.brand.primary}
          inactiveColor={theme.colors.border.subtle}
          onPress={onDotPress ? () => onDotPress(index) : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    alignItems: 'center',
  },
  dotBase: {
    height: spacing[2],
    borderRadius: borderRadius.sm,
  },
});
