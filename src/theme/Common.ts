/* eslint-disable security/detect-object-injection */
import { TextStyle, ViewStyle } from 'react-native';

/**
 * Font Scaling & Accessibility - Automatic by Default
 *
 * All components are responsive by default with no additional configuration required.
 *
 * Built-in Responsive Behavior:
 * 1. All components use `minHeight` instead of fixed `height` - they expand automatically
 * 2. Font scaling is enabled by default - respects user's accessibility settings
 * 3. Flexible padding/spacing accommodates larger text automatically
 * 4. No props needed - just use components and they work responsively
 *
 * Automatic maxFontSizeMultiplier values:
 * - AppText: 2.0 (text can double in size for excellent readability)
 * - AppInput: 1.5 (balances accessibility with form field usability)
 * - AppButton: 2.0 (inherited from AppText - buttons expand vertically)
 *
 * Testing:
 * - iOS: Settings > Display & Brightness > Text Size → Maximum
 * - Android: Settings > Display > Font Size → Largest
 *
 * Note: Components automatically handle font scaling up to iOS maximum (2.35x)
 * and Android equivalents. No developer intervention required!
 */

// Font Weight Types
export type FontWeightKey =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';
export type FontWeightValue =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

/** Plus Jakarta Sans file per weight. Android ignores `fontWeight` on custom
 * fonts, so text must pick the family that matches its weight. */
export const fontFamily: Record<FontWeightValue, string> = {
  '100': 'PlusJakartaSans_400Regular',
  '200': 'PlusJakartaSans_400Regular',
  '300': 'PlusJakartaSans_400Regular',
  '400': 'PlusJakartaSans_400Regular',
  '500': 'PlusJakartaSans_500Medium',
  '600': 'PlusJakartaSans_600SemiBold',
  '700': 'PlusJakartaSans_700Bold',
  '800': 'PlusJakartaSans_800ExtraBold',
  '900': 'PlusJakartaSans_800ExtraBold',
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  16: 64,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
  '8xl': 96,
  '9xl': 128,
} as const;

export const fontWeight: Record<FontWeightKey, FontWeightValue> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;

const t = (
  size: number,
  lh: number,
  weight: FontWeightValue,
  tracking = 0,
) => ({
  fontSize: size,
  lineHeight: Math.round(size * lh),
  fontWeight: weight,
  letterSpacing: tracking,
});

/** Sleek scale: heavy, tight display type; calm body. */
export const typography = {
  h1: t(36, 1.15, '800', -0.8),
  h2: t(32, 1.15, '800', -0.7),
  h3: t(28, 1.2, '800', -0.6),
  h4: t(22, 1.25, '700', -0.4),
  h5: t(20, 1.3, '700', -0.3),
  h6: t(17, 1.35, '700', -0.2),

  bodyLarge: t(18, 1.5, '400'),
  body: t(16, 1.5, '400'),
  bodySmall: t(14, 1.45, '400'),

  label: t(14, 1.3, '600'),
  caption: t(12, 1.4, '500'),
  overline: {
    ...t(12, 1.3, '600', 0.4),
    textTransform: 'none' as const,
  },

  button: t(16, 1.25, '600'),
  buttonSmall: t(14, 1.25, '600'),
  buttonLarge: t(17, 1.25, '600'),
  link: t(16, 1.5, '600'),
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
} as const;

export const shadows = {
  /** The only shadow used in the borderless system: floating elements. */
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 5,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 6,
  },
} as const;

export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
} as const;

export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

export const iconSize = {
  xs: 16,
  sm: 20,
  base: 24,
  md: 28,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
} as const;

/**
 * Button Sizes
 * Uses minHeight instead of fixed height to prevent text clipping when font scaling is enabled.
 * The component will expand to accommodate larger text while maintaining minimum dimensions.
 */
export const buttonSize = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 36,
    borderRadius: borderRadius.full,
  },
  base: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    minHeight: 52,
    borderRadius: borderRadius.full,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 56,
    borderRadius: borderRadius.full,
  },
} as const;

/**
 * Input Sizes
 * Uses minHeight instead of fixed height to prevent text clipping when font scaling is enabled.
 * This ensures text inputs remain accessible with larger system fonts.
 */
export const inputSize = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 40,
    borderRadius: 12,
  },
  base: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 52,
    borderRadius: 14,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    minHeight: 56,
    borderRadius: 16,
  },
} as const;

export const createSpacing = (
  top: keyof typeof spacing,
  right?: keyof typeof spacing,
  bottom?: keyof typeof spacing,
  left?: keyof typeof spacing,
): ViewStyle => {
  return {
    paddingTop: spacing[top],
    paddingRight: spacing[right ?? top],
    paddingBottom: spacing[bottom ?? top],
    paddingLeft: spacing[left ?? right ?? top],
  };
};

export const createMargin = (
  top: keyof typeof spacing,
  right?: keyof typeof spacing,
  bottom?: keyof typeof spacing,
  left?: keyof typeof spacing,
): ViewStyle => {
  return {
    marginTop: spacing[top],
    marginRight: spacing[right ?? top],
    marginBottom: spacing[bottom ?? top],
    marginLeft: spacing[left ?? right ?? top],
  };
};

export const createStyles = <T extends Record<string, ViewStyle | TextStyle>>(
  styles: T,
): T => styles;

export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type IconSize = keyof typeof iconSize;
export type TypographyVariant = keyof typeof typography;
export type ButtonSize = keyof typeof buttonSize;
export type InputSize = keyof typeof inputSize;

// Backward compat for previous imports
export const buttonSizeStyles = buttonSize;
export type CardVariant = 'flat' | 'outlined' | 'elevated';
