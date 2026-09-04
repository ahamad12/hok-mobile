import { useMemo, useState } from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

import { AppView, AppViewProps } from './AppView';
import { Divider } from './Divider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 15, stiffness: 380, mass: 0.8 } as const;

export interface AppCardProps extends Omit<AppViewProps, 'style' | 'children'> {
  variant?: 'flat' | 'outlined' | 'elevated';
  pressable?: boolean;
  onPress?: PressableProps['onPress'];
  style?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({
  variant = 'elevated',
  pressable = false,
  onPress,
  style,
  header,
  footer,
  children,
  ...viewProps
}) => {
  const theme = useTheme();
  const [, setIsPressed] = useState(false);

  const scale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle: ViewStyle = useMemo(
    () => theme.getCardStyle(variant),
    [theme, variant],
  );

  const isPressable = pressable || !!onPress;

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.98, SPRING);
    overlayOpacity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1, SPRING);
    overlayOpacity.value = withTiming(0, { duration: 150 });
  };

  const renderContent = () => {
    if (!header && !footer) {
      return <AppView {...viewProps}>{children}</AppView>;
    }

    return (
      <AppView {...viewProps}>
        {header && (
          <>
            <AppView>{header}</AppView>
            <Divider />
          </>
        )}
        {children && <AppView>{children}</AppView>}
        {footer && (
          <>
            <Divider />
            <AppView>{footer}</AppView>
          </>
        )}
      </AppView>
    );
  };

  if (isPressable) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, style, animatedStyle]}
        accessibilityRole='button'
      >
        {renderContent()}
        <Animated.View
          pointerEvents='none'
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.colors.background.overlay,
              borderRadius: cardStyle.borderRadius,
            },
            overlayStyle,
          ]}
        />
      </AnimatedPressable>
    );
  }

  return <AppView style={[cardStyle, style]}>{renderContent()}</AppView>;
};
