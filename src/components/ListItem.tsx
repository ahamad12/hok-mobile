import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { AppIcon, IconName } from './AppIcon';
import { AppText } from './AppText';

export type IconTileTone =
  | 'neutral'
  | 'brand'
  | 'error'
  | 'info'
  | 'warning'
  | 'success';

export interface IconTileProps {
  icon: IconName;
  tone?: IconTileTone;
  size?: number;
}

/** Rounded square holding a row's icon. Sits on a surface card, so it uses
 * the page background to read as a soft inset rather than a bordered box. */
export const IconTile: React.FC<IconTileProps> = ({
  icon,
  tone = 'neutral',
  size = 36,
}) => {
  const { colors } = useColors();
  const map: Record<IconTileTone, [string, string]> = {
    neutral: [colors.background.default, colors.icon.default],
    brand: [colors.background.default, colors.icon.primary],
    success: [colors.background.successSubtle, colors.icon.success],
    error: [colors.background.errorSubtle, colors.icon.error],
    info: [colors.background.infoSubtle, colors.icon.info],
    warning: [colors.background.warningSubtle, colors.icon.warning],
  };
  const [bg, fg] = map[tone];
  return (
    <View
      style={[styles.tile, { width: size, height: size, backgroundColor: bg }]}>
      <AppIcon
        name={icon}
        size={Math.round(size * 0.5)}
        color={fg}
        strokeWidth={1.9}
      />
    </View>
  );
};

export interface ListItemProps {
  title: string;
  /** Max lines for the title (default 1). */
  titleLines?: number;
  subtitle?: string;
  icon?: IconName;
  iconTone?: IconTileTone;
  /** Replaces the icon tile (e.g. an Avatar). */
  leading?: React.ReactNode;
  /** Text shown on the right, before the chevron. */
  value?: string;
  /** Custom right-side element (badge, button, toggle). */
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Defaults to true when `onPress` is set. */
  chevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  /** Extra content under the subtitle (chips etc). */
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  titleLines = 1,
  subtitle,
  icon,
  iconTone,
  leading,
  value,
  trailing,
  onPress,
  chevron,
  destructive = false,
  disabled = false,
  children,
  style,
}) => {
  const { colors } = useColors();
  const showChevron = chevron ?? !!onPress;

  const content = (
    <>
      {leading ??
        (icon ? (
          <IconTile icon={icon} tone={destructive ? 'error' : iconTone} />
        ) : null)}
      <View style={styles.body}>
        <AppText
          variant='body'
          weight='semibold'
          customColor={destructive ? colors.text.error : undefined}
          numberOfLines={titleLines}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant='bodySmall' color='secondary' numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </View>
      {value ? (
        <AppText variant='bodySmall' color='tertiary' numberOfLines={1}>
          {value}
        </AppText>
      ) : null}
      {trailing}
      {showChevron ? (
        <AppIcon name='ChevronRight' size={18} color={colors.icon.tertiary} />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, style]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole='button'
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: colors.background.overlay },
        disabled && styles.disabled,
        style,
      ]}>
      {content}
    </Pressable>
  );
};

export interface ListSectionProps {
  title?: string;
  /** Right side of the section heading (e.g. a "See all" link). */
  action?: React.ReactNode;
  footer?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Grouped rows on one tonal surface — no outline, hairline separators. */
export const ListSection: React.FC<ListSectionProps> = ({
  title,
  action,
  footer,
  children,
  style,
}) => {
  const { colors } = useColors();
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.section, style]}>
      {title || action ? (
        <View style={styles.sectionHeader}>
          {title ? (
            <AppText variant='label' color='secondary'>
              {title}
            </AppText>
          ) : (
            <View />
          )}
          {action}
        </View>
      ) : null}
      <View
        style={[styles.card, { backgroundColor: colors.background.surface }]}>
        {items.map((child, i) => (
          <React.Fragment key={i}>
            {i > 0 ? (
              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border.subtle },
                ]}
              />
            ) : null}
            {child}
          </React.Fragment>
        ))}
      </View>
      {footer ? (
        <AppText variant='caption' color='tertiary' style={styles.footer}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3] + 2,
    minHeight: 60,
  },
  body: { flex: 1, gap: 2 },
  disabled: { opacity: 0.5 },
  section: { gap: spacing[2] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[1],
    minHeight: 28,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing[4] + 36 + spacing[3],
  },
  footer: { paddingHorizontal: spacing[1] },
});
