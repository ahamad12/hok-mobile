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

export const typography = {
  // Headings
  h1: {
    fontSize: fontSize['5xl'],
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.snug,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.normal,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },

  // Body Text
  bodyLarge: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.relaxed,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Labels & Captions
  label: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  overline: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Interactive Elements
  button: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  buttonSmall: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  buttonLarge: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  link: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const shadows = {
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
    paddingHorizontal: spacing[3],
    minHeight: 32,
    borderRadius: borderRadius.base,
  },
  base: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
    borderRadius: borderRadius.md,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 56,
    borderRadius: borderRadius.lg,
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
    minHeight: 36,
    borderRadius: borderRadius.base,
  },
  base: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 48,
    borderRadius: borderRadius.md,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    minHeight: 56,
    borderRadius: borderRadius.lg,
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
