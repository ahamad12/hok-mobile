import React from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { borderRadius, spacing } from '@/theme/Common';

export interface CarouselIndicatorProps {
  totalItems: number;
  currentIndex: number;
  style?: ViewStyle;
}

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
  dotActive: {
    width: spacing[6],
  },
  dotInactive: {
    width: spacing[2],
  },
});

export const CarouselIndicator: React.FC<CarouselIndicatorProps> = ({
  totalItems,
  currentIndex,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalItems }).map((_, index) => {
        const isActive = index === currentIndex;
        return (
          <Animated.View
            key={index}
            style={[
              styles.dotBase,
              isActive ? styles.dotActive : styles.dotInactive,
              {
                backgroundColor: isActive
                  ? theme.colors.brand.primary
                  : theme.colors.border.subtle,
              },
            ]}
          />
        );
      })}
    </View>
  );
};