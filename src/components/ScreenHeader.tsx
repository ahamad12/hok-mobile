import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { useUser } from '@/features/auth/hooks/useAuth';
import { spacing } from '@/theme/Common';

import { IconName } from './AppIcon';
import { Avatar } from './Avatar';
import { HokWordmark } from './HokMark';
import { IconButton } from './IconButton';
import { PageTitle } from './PageTitle';

export interface ScreenHeaderProps {
  title: string;
  /** @deprecated Shown as the subtitle when no subtitle is given. */
  eyebrow?: string;
  subtitle?: string;
  actionIcon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Main action gets the solid primary circle. */
  actionSolid?: boolean;
  style?: ViewStyle;
}

// The header wordmark carves itself in once per app launch, then stays put
// as you move between tabs.
let carved = false;

/**
 * Top of each business-level tab: the HOK bar (wordmark, your avatar to
 * Account), then the page title in the logo's style.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  eyebrow,
  subtitle,
  actionIcon,
  actionLabel,
  onAction,
  actionSolid = true,
  style,
}) => {
  const router = useRouter();
  const user = useUser();
  const { colors } = useColors();
  const [animate] = useState(() => {
    const first = !carved;
    carved = true;
    return first;
  });

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.bar}>
        <HokWordmark
          height={20}
          color={colors.text.primary}
          animate={animate}
        />
        <Pressable
          onPress={() => router.navigate('/account')}
          hitSlop={8}
          accessibilityRole='button'
          accessibilityLabel='Your account'>
          <Avatar name={user?.displayName ?? user?.email} size='sm' solid />
        </Pressable>
      </View>
      <View style={styles.titleRow}>
        <PageTitle
          title={title}
          subtitle={subtitle ?? eyebrow}
          style={styles.flex}
        />
        {actionIcon && onAction ? (
          <IconButton
            icon={actionIcon}
            label={actionLabel ?? title}
            onPress={onAction}
            variant={actionSolid ? 'solid' : 'surface'}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { paddingTop: spacing[3], paddingBottom: spacing[5], gap: spacing[8] },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[3] },
});
