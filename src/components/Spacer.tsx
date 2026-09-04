import { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/Common';

export interface SpacerProps {
  size?: Spacing;
  customSize?: number;
  direction?: 'horizontal' | 'vertical';
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 4,
  customSize,
  direction = 'vertical',
}) => {
  const theme = useTheme();

  const spacerStyle: ViewStyle = useMemo(() => {
    const spacing = customSize ?? theme.spacing[size];

    return direction === 'horizontal'
      ? { width: spacing }
      : { height: spacing };
  }, [theme, size, customSize, direction]);

  return <View style={spacerStyle} />;
};