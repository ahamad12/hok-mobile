import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAppStyles } from '@/hooks/useAppStyles';
import { ColorPallete } from '@/theme/Colors';

interface AppActivityIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const SIZES = { sm: 32, md: 48, lg: 64 };

export const AppActivityIndicator: React.FC<AppActivityIndicatorProps> = ({
  size = 'md',
  color,
}) => {
  const rotation = useSharedValue(0);
  const breathe = useSharedValue(1);
  const dynamicColors = useAppStyles(stylesFunc);
  const finalColor = color || dynamicColors.primaryStyle.color;
  const accentColor = dynamicColors.accentStyle.color;

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
    );
    breathe.value = withRepeat(
      withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [rotation, breathe]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: breathe.value }],
  }));

  const indicatorSize = SIZES[size];
  const borderWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <View
      style={[styles.container, { width: indicatorSize, height: indicatorSize }]}
      accessibilityRole='progressbar'
      accessibilityLabel='Loading'
    >
      <Animated.View style={spinStyle}>
        <LinearGradient
          colors={[
            accentColor,
            finalColor,
            dynamicColors.backgroundStyle.backgroundColor as string,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: indicatorSize,
            height: indicatorSize,
            borderRadius: indicatorSize / 2,
            padding: borderWidth,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: (indicatorSize - borderWidth * 2) / 2,
            }}
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const stylesFunc = (colors: ColorPallete) => ({
  primaryStyle: { color: colors.brand.primary },
  accentStyle: { color: colors.brand.accent },
  backgroundStyle: { backgroundColor: colors.background.subtle },
});

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});
