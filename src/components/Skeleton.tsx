import { useEffect } from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** Pulsing placeholder block. */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 14,
  radius = borderRadius.base,
  style,
}) => {
  const { colors } = useColors();
  const o = useSharedValue(0.55);

  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [o]);

  const anim = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility='no-hide-descendants'
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.background.subtle,
        },
        anim,
        style,
      ]}
    />
  );
};

/** Skeleton shaped like a ListItem row. */
export const SkeletonRow: React.FC = () => (
  <View style={styles.row}>
    <Skeleton width={40} height={40} radius={borderRadius.md} />
    <View style={styles.rowBody}>
      <Skeleton width='60%' height={14} />
      <Skeleton width='35%' height={10} />
    </View>
  </View>
);

/** Skeleton shaped like a shop / media card. */
export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <Skeleton height={240} radius={borderRadius['2xl']} />
    <Skeleton width='55%' height={16} />
    <Skeleton width='40%' height={12} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  rowBody: { flex: 1, gap: spacing[2] },
  card: { gap: spacing[2], marginBottom: spacing[8] },
});
