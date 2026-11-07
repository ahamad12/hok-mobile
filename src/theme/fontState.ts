import { fontFamily, FontWeightValue } from './Common';

// Set once by useThemeFonts. If the font failed to load we keep the system
// font, because an unknown fontFamily throws a red-box on iOS in dev.
let available = false;

export const setCustomFontsAvailable = (value: boolean) => {
  available = value;
};

/** fontFamily for a weight, or undefined to use the system font. */
export const familyFor = (weight?: string | number): string | undefined => {
  if (!available) return undefined;
  const key = String(weight ?? '400') as FontWeightValue;
  return fontFamily[key] ?? fontFamily['400'];
};
