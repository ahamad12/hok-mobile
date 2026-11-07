import { StyleSheet, View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { AppButton, AppButtonProps } from './AppButton';
import { AppIcon, IconName } from './AppIcon';
import { AppText } from './AppText';

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  actionIcon?: AppButtonProps['iconLeft'];
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  body,
  actionLabel,
  actionIcon,
  onAction,
  style,
}) => {
  const { colors } = useColors();
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[styles.circle, { backgroundColor: colors.background.surface }]}>
        <AppIcon
          name={icon}
          size={30}
          color={colors.icon.primary}
          strokeWidth={1.6}
        />
      </View>
      <AppText variant='h5' align='center'>
        {title}
      </AppText>
      {body ? (
        <AppText
          variant='bodySmall'
          color='secondary'
          align='center'
          style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          onPress={onAction}
          iconLeft={actionIcon}
          style={styles.action}>
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[12],
    gap: spacing[2],
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  body: { maxWidth: 300 },
  action: { marginTop: spacing[4], paddingHorizontal: spacing[6] },
});
