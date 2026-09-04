import React from 'react';
import { View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';

type DividerProps = {
  style?: ViewStyle;
};

export const Divider: React.FC<DividerProps> = ({ style }) => {
  const { colors } = useColors();
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: colors.border.subtle,
          width: '100%',
        },
        style,
      ]}
    />
  );
};
