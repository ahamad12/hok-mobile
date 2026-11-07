import { useMemo } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Background } from '@/theme/Colors';
import { BorderRadius, Shadow, Spacing } from '@/theme/Common';

export interface AppViewProps extends ViewProps {
  p?: Spacing;
  px?: Spacing;
  py?: Spacing;
  pt?: Spacing;
  pr?: Spacing;
  pb?: Spacing;
  pl?: Spacing;
  m?: Spacing;
  mx?: Spacing;
  my?: Spacing;
  mt?: Spacing;
  mr?: Spacing;
  mb?: Spacing;
  ml?: Spacing;
  bg?: keyof Background;
  customBg?: string;
  radius?: BorderRadius;
  shadow?: Shadow;
  flex?: number;
  row?: boolean;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean;
  gap?: Spacing;
  width?: number;
  height?: number;
  borderWidth?: number;
  borderColor?: string;
}

export const AppView: React.FC<AppViewProps> = ({
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  bg,
  customBg,
  radius,
  shadow,
  flex,
  row,
  align,
  justify,
  wrap,
  gap,
  width,
  height,
  borderWidth,
  borderColor,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();

  const viewStyle: ViewStyle = useMemo(() => {
    const paddingStyle: ViewStyle = {};
    const marginStyle: ViewStyle = {};
    const layoutStyle: ViewStyle = {};

    // Padding
    if (p !== undefined) {
      paddingStyle.padding = theme.spacing[p];
    }
    if (px !== undefined) {
      paddingStyle.paddingHorizontal = theme.spacing[px];
    }
    if (py !== undefined) {
      paddingStyle.paddingVertical = theme.spacing[py];
    }
    if (pt !== undefined) {
      paddingStyle.paddingTop = theme.spacing[pt];
    }
    if (pr !== undefined) {
      paddingStyle.paddingRight = theme.spacing[pr];
    }
    if (pb !== undefined) {
      paddingStyle.paddingBottom = theme.spacing[pb];
    }
    if (pl !== undefined) {
      paddingStyle.paddingLeft = theme.spacing[pl];
    }

    // Margin
    if (m !== undefined) {
      marginStyle.margin = theme.spacing[m];
    }
    if (mx !== undefined) {
      marginStyle.marginHorizontal = theme.spacing[mx];
    }
    if (my !== undefined) {
      marginStyle.marginVertical = theme.spacing[my];
    }
    if (mt !== undefined) {
      marginStyle.marginTop = theme.spacing[mt];
    }
    if (mr !== undefined) {
      marginStyle.marginRight = theme.spacing[mr];
    }
    if (mb !== undefined) {
      marginStyle.marginBottom = theme.spacing[mb];
    }
    if (ml !== undefined) {
      marginStyle.marginLeft = theme.spacing[ml];
    }

    // Background
    if (bg && !customBg) {
      layoutStyle.backgroundColor = theme.colors.background[bg];
    }
    if (customBg) {
      layoutStyle.backgroundColor = customBg;
    }

    // Border radius
    if (radius !== undefined) {
      layoutStyle.borderRadius = theme.borderRadius[radius];
    }

    // Shadow
    if (shadow !== undefined) {
      Object.assign(layoutStyle, theme.getShadow(shadow));
    }

    // Layout
    if (flex !== undefined) {
      layoutStyle.flex = flex;
    }
    if (row) {
      layoutStyle.flexDirection = 'row';
    }
    if (align) {
      layoutStyle.alignItems = align;
    }
    if (justify) {
      layoutStyle.justifyContent = justify;
    }
    if (wrap) {
      layoutStyle.flexWrap = 'wrap';
    }
    if (gap !== undefined) {
      layoutStyle.gap = theme.spacing[gap];
    }
    if (width !== undefined) {
      layoutStyle.width = width;
    }
    if (height !== undefined) {
      layoutStyle.height = height;
    }
    if (borderWidth !== undefined) {
      layoutStyle.borderWidth = borderWidth;
    }
    if (borderColor) {
      layoutStyle.borderColor = borderColor;
    }

    return {
      ...paddingStyle,
      ...marginStyle,
      ...layoutStyle,
    };
  }, [
    theme,
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    bg,
    customBg,
    radius,
    shadow,
    flex,
    row,
    align,
    justify,
    wrap,
    gap,
    width,
    height,
    borderWidth,
    borderColor,
  ]);

  return (
    <View style={[viewStyle, style]} {...props}>
      {children}
    </View>
  );
};
