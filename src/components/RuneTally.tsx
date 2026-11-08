import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { useColors } from '@/contexts/ColorContext';
import { palette } from '@/theme/Colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const KNIFE = Easing.bezier(0.7, 0, 0.2, 1);

const H = 28;
const GAP = 12;
const STROKE = 5;

export interface RuneTallyProps {
  /** 1-based current step. */
  step: number;
  total: number;
}

function Cut({
  d,
  len,
  color,
  carve,
}: {
  d: string;
  len: number;
  color: string;
  carve: boolean;
}) {
  const reduced = useReducedMotion();
  const p = useSharedValue(carve && !reduced ? 0 : 1);
  useEffect(() => {
    if (carve && !reduced) {
      p.value = withTiming(1, { duration: 160, easing: KNIFE });
    }
  }, [carve, reduced, p]);
  const props = useAnimatedProps(() => ({
    strokeDashoffset: len * (1 - p.value),
  }));
  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={STROKE}
      strokeDasharray={[len, len]}
      fill='none'
      animatedProps={props}
    />
  );
}

/**
 * Wizard progress as carved tally staves: one stave per step, the fifth
 * struck across the first four the way the H of HOK is. Done staves are
 * ink, the current one is rust (and carved in fresh), later ones faint.
 */
export function RuneTally({ step, total }: RuneTallyProps) {
  const { colors } = useColors();
  const ink = colors.text.primary;
  const faint = colors.border.subtle;
  const staves = Math.min(total, 4);
  const width = staves * GAP + (total >= 5 ? GAP : 0);

  const colorFor = (i: number) =>
    i + 1 < step ? ink : i + 1 === step ? palette.hok.rust : faint;

  return (
    <Svg
      width={width}
      height={H}
      viewBox={`-${STROKE} 0 ${width + STROKE} ${H}`}
      accessibilityRole='progressbar'
      accessibilityLabel={`Step ${step} of ${total}`}>
      {Array.from({ length: staves }, (_, i) => (
        <Cut
          key={`${i}-${i + 1 === step}`}
          d={`M${i * GAP} 2V${H - 2}`}
          len={H}
          color={colorFor(i)}
          carve={i + 1 === step}
        />
      ))}
      {total >= 5 ? (
        <Cut
          key={`strike-${step === 5}`}
          d={`M${-STROKE} ${H - 6}L${staves * GAP} 6`}
          len={width + 8}
          color={colorFor(4)}
          carve={step === 5}
        />
      ) : null}
    </Svg>
  );
}
