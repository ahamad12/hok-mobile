import { StyleSheet, View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { getInitials } from '@/utils/initials';

import { AppText } from './AppText';

export { getInitials };

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 56, xl: 88 };
const FONT: Record<AvatarSize, number> = { sm: 13, md: 16, lg: 20, xl: 30 };

export interface AvatarProps {
  /** Name or email to derive initials from. */
  name?: string | null;
  size?: AvatarSize;
  /** Use the inverse (solid) look — for the user's own avatar. */
  solid?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  solid = false,
  style,
}) => {
  const { colors } = useColors();
  const dim = SIZE[size];

  return (
    <View
      style={[
        styles.box,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: solid
            ? colors.background.inverse
            : colors.background.subtle,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility='no'>
      <AppText
        weight='bold'
        customColor={solid ? colors.text.inverse : colors.text.primary}
        style={{ fontSize: FONT[size], lineHeight: FONT[size] * 1.2 }}
        maxFontSizeMultiplier={1.2}>
        {getInitials(name)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
