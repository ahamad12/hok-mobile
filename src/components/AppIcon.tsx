import * as Lucide from 'lucide-react-native';
import React from 'react';
import { ViewStyle } from 'react-native';

export type IconName = keyof typeof Lucide;

export type AppIconProps = {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: ViewStyle;
  strokeWidth?: number;
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color,
  style,
  strokeWidth,
}) => {
  const IconComponent = (
    Lucide as unknown as Record<
      string,
      React.ComponentType<{
        size: number;
        color: string;
        style?: ViewStyle;
        strokeWidth?: number;
      }>
    >
  )[name];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color as string}
      style={style}
      strokeWidth={strokeWidth}
    />
  );
};
