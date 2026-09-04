import { useMemo } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { FontWeightKey, TypographyVariant } from '@/theme/Common';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'disabled'
    | 'inverse'
    | 'link'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
  customColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: FontWeightKey;
  uppercase?: boolean;
  italic?: boolean;
  numberOfLines?: number;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  customColor,
  align,
  weight,
  uppercase,
  italic,
  numberOfLines,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const textStyle: TextStyle = useMemo(() => {
    const baseStyle = theme.getTypography(variant, color);

    const getFontWeight = (): TextStyle['fontWeight'] => {
      // If weight is explicitly provided, use it
      if (weight) {
        return theme.fontWeight[weight];
      }
      // Otherwise use the variant's default weight
      if (baseStyle.fontWeight) {
        return baseStyle.fontWeight as TextStyle['fontWeight'];
      }
      // Fallback to normal
      return theme.fontWeight.normal;
    };

    return {
      fontSize: baseStyle.fontSize,
      lineHeight: baseStyle.lineHeight,
      letterSpacing: baseStyle.letterSpacing,
      color: customColor || baseStyle.color,
      fontWeight: getFontWeight(),
      ...(align && { textAlign: align }),
      ...(uppercase && { textTransform: 'uppercase' }),
      ...(italic && { fontStyle: 'italic' }),
    };
  }, [theme, variant, color, customColor, align, weight, uppercase, italic]);

  return (
    <Text
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={2}
      allowFontScaling={true}
      {...props}>
      {children}
    </Text>
  );
};