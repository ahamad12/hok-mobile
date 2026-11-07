import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { Row } from './Row';

export interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAccessory?: React.ReactNode;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
  rightAccessory,
  style,
}) => {
  const router = useRouter();
  const { colors } = useColors();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    router.back();
  };

  return (
    <Row
      align='center'
      justify='space-between'
      style={[styles.container, style]}>
      <Row align='center' gap={3} flex={1}>
        {showBackButton && (
          <Pressable
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole='button'
            accessibilityLabel='Go back'>
            <AppIcon
              name='ChevronLeft'
              size={spacing[6]}
              color={colors.text.primary}
            />
          </Pressable>
        )}
        <AppText
          variant='h5'
          weight='bold'
          numberOfLines={1}
          style={styles.title}>
          {title}
        </AppText>
      </Row>
      {rightAccessory}
    </Row>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    minHeight: 44,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing[2],
  },
  title: { flexShrink: 1 },
});
