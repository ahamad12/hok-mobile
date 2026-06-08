import { useMemo } from 'react';
// this is intentional
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { StyleSheet } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { ColorPallete } from '@/theme';

// eslint-disable-next-line no-unused-vars
export function useAppStyles<T>(stylesFunc: (colors: ColorPallete) => T): T {
  const { colors } = useColors();
  return useMemo(() => stylesFunc(colors), [stylesFunc, colors]);
}

// this is intentional
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStyleSheet<T extends StyleSheet.NamedStyles<any>>(
  // eslint-disable-next-line no-unused-vars
  stylesFunc: (colors: ColorPallete) => T,
) {
  return (colors: ColorPallete) => {
    return StyleSheet.create(stylesFunc(colors));
  };
}
