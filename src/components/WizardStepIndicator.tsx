import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/Common';

import { PageTitle } from './PageTitle';
import { RuneTally } from './RuneTally';

export interface WizardStepIndicatorProps {
  /** 1-based current step. */
  step: number;
  total: number;
  label: string;
  hint?: string;
}

/** Carved tally for the step count, then the step's heading and hint. */
export const WizardStepIndicator: React.FC<WizardStepIndicatorProps> = ({
  step,
  total,
  label,
  hint,
}) => (
  <View style={styles.wrap}>
    <RuneTally step={step} total={total} />
    <PageTitle title={label} subtitle={hint} size='form' />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing[5] },
});
