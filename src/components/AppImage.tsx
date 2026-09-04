import { useMemo, useState } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  ImageURISource,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { BorderRadius } from '@/theme/Common';

import { AppIcon, IconName } from './AppIcon';
import { AppView } from './AppView';

export interface AppImageProps
  extends Omit<ImageProps, 'source' | 'width' | 'height'> {
  source: ImageURISource | number;
  fallbackIcon?: IconName;
  radius?: BorderRadius;
  width?: number;
  height?: number;
  aspectRatio?: number;
  containerStyle?: ViewStyle;
  style?: ImageStyle;
  onError?: () => void;
}

export const AppImage: React.FC<AppImageProps> = ({
  source,
  fallbackIcon = 'Image',
  radius,
  width,
  height,
  aspectRatio,
  containerStyle,
  style,
  onError,
  ...props
}) => {
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageContainerStyle: ViewStyle = useMemo(() => {
    return {
      width: width || '100%',
      ...(height && { height }),
      ...(aspectRatio && { aspectRatio }),
      ...(radius && { borderRadius: theme.borderRadius[radius] }),
      overflow: 'hidden',
      backgroundColor: theme.colors.background.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    };
  }, [width, height, aspectRatio, radius, theme]);

  const imageStyle: ImageStyle = useMemo(() => {
    return {
      width: '100%',
      height: '100%',
      ...(radius && { borderRadius: theme.borderRadius[radius] }),
    };
  }, [radius, theme]);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <AppView style={[imageContainerStyle, containerStyle]}>
        <AppIcon
          name={fallbackIcon}
          size={Math.min(
            typeof width === 'number' ? width / 2 : 48,
            typeof height === 'number' ? height / 2 : 48,
          )}
          color={theme.colors.text.tertiary}
        />
      </AppView>
    );
  }

  return (
    <AppView style={[imageContainerStyle, containerStyle]}>
      <Image
        source={source}
        style={[imageStyle, style]}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {isLoading && (
        <AppView style={StyleSheet.absoluteFill}>
          <AppIcon
            name='Loader'
            size={theme.iconSize.md}
            color={theme.colors.text.tertiary}
          />
        </AppView>
      )}
    </AppView>
  );
};