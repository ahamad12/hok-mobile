import { StyleSheet, View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { ColorPallete } from '@/theme/Colors';
import { borderRadius, spacing } from '@/theme/Common';

import { AppIcon, IconName } from './AppIcon';
import { AppText } from './AppText';

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'inverse';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  style?: ViewStyle;
}

const toneColors = (
  colors: ColorPallete,
  tone: BadgeTone,
): { bg: string; fg: string } => {
  switch (tone) {
    case 'brand':
      return { bg: colors.background.inverse, fg: colors.text.inverse };
    case 'inverse':
      return { bg: colors.background.default, fg: colors.text.primary };
    case 'success':
      return { bg: colors.background.successSubtle, fg: colors.text.success };
    case 'warning':
      return { bg: colors.background.warningSubtle, fg: colors.text.warning };
    case 'error':
      return { bg: colors.background.errorSubtle, fg: colors.text.error };
    case 'info':
      return { bg: colors.background.infoSubtle, fg: colors.text.info };
    default:
      return { bg: colors.background.subtle, fg: colors.text.secondary };
  }
};

/** Small pill for role / status. Tonal, never outlined. */
export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  icon,
  style,
}) => {
  const { colors } = useColors();
  const { bg, fg } = toneColors(colors, tone);

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      {icon ? (
        <AppIcon name={icon} size={12} color={fg} strokeWidth={2.4} />
      ) : null}
      <AppText
        variant='caption'
        weight='semibold'
        customColor={fg}
        maxFontSizeMultiplier={1.4}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[1],
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
});
