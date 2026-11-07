import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Path, Polygon, Rect, Svg } from 'react-native-svg';

import { palette } from '@/theme/Colors';

const { ink, bone, rust } = palette.hok;

type NotchProps = {
  size?: number;
  /** Colour of the K block. Defaults to bone (for ink backgrounds). */
  color?: string;
  /** Draw the ink tile behind the mark, as on the app icon. */
  tile?: boolean;
};

/** The Hok "Notch" mark: a rust stave beside a block with K's wedge cut out. */
export function HokNotch({ size = 40, color = bone, tile = false }: NotchProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={tile ? '0 0 100 100' : '18 18 64 64'}
      accessibilityLabel='Hok'>
      {tile ? <Rect width={100} height={100} fill={ink} /> : null}
      <Polygon points='34,18 82,18 82,31 52,50 82,69 82,82 34,82' fill={color} />
      <Rect x={18} y={18} width={12} height={64} fill={rust} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Wordmark, carved like a runestone: every stroke is one knife cut, made in
// the order and direction a carver would cut it. Geometry matches
// assets/brand/hok-wordmark.svg.

const AnimatedPath = Animated.createAnimatedComponent(Path);
const KNIFE = Easing.bezier(0.7, 0, 0.2, 1);
const STROKE = 13;

type Cut = {
  d: string;
  len: number;
  dur: number;
  /** Pause after this cut, as the carver lifts the knife. */
  lift: number;
  rust?: boolean;
  cap: 'butt' | 'square';
};

const STAVE = { len: 81, dur: 130, lift: 40, cap: 'butt' } as const;
const HEX_SHORT = { len: 34, dur: 90, lift: 20, cap: 'square' } as const;
const HEX_LONG = { len: 45, dur: 90, lift: 20, cap: 'square' } as const;
const ARM = { len: 56, dur: 120, lift: 40, cap: 'butt' } as const;

const CUTS: Cut[] = [
  // H: both staves, top to bottom
  { d: 'M16 10V90', ...STAVE },
  { d: 'M56 10V90', ...STAVE },
  // O: six chisel strokes, clockwise from the top point
  { d: 'M110 10L138 28', ...HEX_SHORT },
  { d: 'M138 28V72', ...HEX_LONG },
  { d: 'M138 72L110 90', ...HEX_SHORT },
  { d: 'M110 90L82 72', ...HEX_SHORT },
  { d: 'M82 72V28', ...HEX_LONG },
  { d: 'M82 28L110 10', ...HEX_SHORT, lift: 40 },
  // K: stem, then both arms outward from the joint
  { d: 'M172 10V90', ...STAVE },
  { d: 'M172 50L210 10', ...ARM },
  { d: 'M172 50L210 90', ...ARM },
  // The rust strike across the H, a slower final cut
  { d: 'M8 66L64 34', len: 66, dur: 260, lift: 0, cap: 'butt', rust: true },
];

const TIMED = CUTS.reduce<{ at: number; cuts: (Cut & { at: number })[] }>(
  (acc, cut) => ({
    at: acc.at + cut.dur + cut.lift,
    cuts: [...acc.cuts, { ...cut, at: acc.at }],
  }),
  { at: 0, cuts: [] },
);

/** Total carving time in ms; screens can time their own entrance from it. */
export const CARVE_MS = TIMED.at;

type WordmarkProps = { height?: number; color?: string };

function CarvedStroke({
  cut,
  color,
  still,
}: {
  cut: Cut & { at: number };
  color: string;
  still: boolean;
}) {
  const progress = useSharedValue(still ? 1 : 0);

  useEffect(() => {
    if (!still) {
      progress.value = withDelay(
        cut.at,
        withTiming(1, { duration: cut.dur, easing: KNIFE }),
      );
    }
  }, [cut.at, cut.dur, progress, still]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: cut.len * (1 - progress.value),
  }));

  return (
    <AnimatedPath
      d={cut.d}
      stroke={cut.rust ? rust : color}
      strokeWidth={cut.rust ? 11 : STROKE}
      strokeLinecap={cut.cap}
      strokeDasharray={[cut.len, cut.len]}
      fill='none'
      animatedProps={animatedProps}
    />
  );
}

/**
 * HOK wordmark carved into place on mount (about 1.8 s), ending with a 1px
 * settle as the last cut lands. Shown fully carved when reduce motion is on.
 */
export function HokWordmark({ height = 24, color = bone }: WordmarkProps) {
  const still = useReducedMotion();
  const settle = useSharedValue(0);

  useEffect(() => {
    if (!still) {
      settle.value = withDelay(
        CARVE_MS,
        withSequence(
          withTiming(1, { duration: 60 }),
          withTiming(0, { duration: 140, easing: Easing.out(Easing.quad) }),
        ),
      );
    }
  }, [settle, still]);

  const settleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: settle.value }],
  }));

  return (
    <Animated.View style={settleStyle} accessible accessibilityLabel='Hok'>
      <Svg
        width={(height * 242) / 112}
        height={height}
        viewBox='-6 -6 242 112'>
        {TIMED.cuts.map((cut) => (
          <CarvedStroke key={cut.d} cut={cut} color={color} still={still} />
        ))}
      </Svg>
    </Animated.View>
  );
}
