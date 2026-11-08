import React, { ReactNode, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { IconName } from '@/components/AppIcon';
import { useTabBarInset } from '@/components/FloatingTabBar';
import { IconButton } from '@/components/IconButton';
import { PageTitle } from '@/components/PageTitle';
import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { ShopHeaderBar } from './ShopHeaderBar';

type Action = { icon: IconName; label: string; onPress: () => void };

type Props = {
  title: string;
  subtitle?: string;
  actions?: Action[];
  /** Sits under the title, outside the scroll padding rules (chips etc). */
  toolbar?: ReactNode;
  onRefresh?: () => Promise<unknown> | void;
  /** Render your own list (FlatList) instead of the default ScrollView. */
  scroll?: boolean;
  /**
   * Pushed (not a tab root): "‹ Back" instead of "‹ All hoks", and no room
   * kept for the floating tab bar, which is not shown on pushed screens.
   */
  pushed?: boolean;
  children: ReactNode;
};

/**
 * Chrome for a tab inside one shop: "‹ All shops" (owners and managers),
 * the shop's name, a large title with actions, then content that clears
 * the floating tab bar.
 */
export function ShopTabScreen({
  title,
  subtitle,
  actions = [],
  toolbar,
  onRefresh,
  scroll = true,
  pushed = false,
  children,
}: Props) {
  const { colors } = useColors();
  const insets = useSafeAreaInsets();
  const tabInset = useTabBarInset();
  const bottom = pushed ? insets.bottom + spacing[8] : tabInset;
  const [refreshing, setRefreshing] = useState(false);

  const refresh = onRefresh
    ? async () => {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
    : undefined;

  const header = (
    <View style={styles.header}>
      <ShopHeaderBar pushed={pushed} />
      <View style={styles.titleRow}>
        <PageTitle title={title} subtitle={subtitle} style={styles.flex} />
        {actions.map((a, i) => (
          <IconButton
            key={a.label}
            icon={a.icon}
            label={a.label}
            onPress={a.onPress}
            variant={i === actions.length - 1 ? 'solid' : 'surface'}
          />
        ))}
      </View>
      {toolbar}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: bottom }]}
          keyboardShouldPersistTaps='handled'
          refreshControl={
            refresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={colors.text.primary}
              />
            ) : undefined
          }>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>
          <View style={styles.pad}>{header}</View>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[6] },
  body: { paddingHorizontal: spacing[6], gap: spacing[6] },
  header: { gap: spacing[6], paddingTop: spacing[2] },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] },
});
