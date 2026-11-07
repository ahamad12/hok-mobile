import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { AppText } from './AppText';

export interface WizardStepIndicatorProps {
  /** 1-based current step. */
  step: number;
  total: number;
  label: string;
  hint?: string;
}

export const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  step,
  total,
  label,
  hint,
}) => {
  const { colors } = useColors();
  const progress = useSharedValue(step / total);

  useEffect(() => {
    progress.value = withSpring(step / total, { damping: 20, stiffness: 180 });
  }, [step, total, progress]);

  const fill = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={styles.wrap}
      accessibilityRole='progressbar'
      accessibilityLabel={`Step ${step} of ${total}: ${label}`}>
      <View style={styles.headRow}>
        <AppText variant='overline' customColor={colors.brand.primary}>
          {`Step ${step} of ${total}`}
        </AppText>
      </View>
      <AppText variant='h4'>{label}</AppText>
      {hint ? (
        <AppText variant='bodySmall' color='secondary'>
          {hint}
        </AppText>
      ) : null}
      <View
        style={[styles.track, { backgroundColor: colors.background.subtle }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: colors.brand.primary }, fill]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing[1] },
  headRow: { flexDirection: 'row', justifyContent: 'space-between' },
  track: {
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing[3],
  },
  fill: { height: '100%', borderRadius: borderRadius.full },
});
