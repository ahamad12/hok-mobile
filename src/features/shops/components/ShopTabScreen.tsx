import { useRouter } from 'expo-router';
import React, { ReactNode, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, IconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useTabBarInset } from '@/components/FloatingTabBar';
import { IconButton } from '@/components/IconButton';
import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { useCurrentShop, useShopRole } from '../hooks/useShopContext';

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
  children,
}: Props) {
  const router = useRouter();
  const { colors } = useColors();
  const bottom = useTabBarInset();
  const { shop } = useCurrentShop();
  const { hasTenantLevel } = useShopRole();
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

  const goAllShops = () =>
    router.canDismiss() ? router.dismissTo('/shops') : router.replace('/shops');

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {hasTenantLevel ? (
          <Pressable
            onPress={goAllShops}
            hitSlop={10}
            accessibilityRole='button'
            accessibilityLabel='All shops'
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <AppIcon
              name='ChevronLeft'
              size={18}
              color={colors.text.secondary}
            />
            <AppText variant='label' color='secondary'>
              All shops
            </AppText>
          </Pressable>
        ) : null}
        <AppText
          variant='label'
          color='tertiary'
          numberOfLines={1}
          style={styles.shopName}>
          {shop?.name ?? ''}
        </AppText>
      </View>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <AppText variant='h2' accessibilityRole='header' numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant='bodySmall' color='secondary'>
              {subtitle}
            </AppText>
          ) : null}
        </View>
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
  pad: { paddingHorizontal: spacing[5] },
  body: { paddingHorizontal: spacing[5], gap: spacing[6] },
  header: { gap: spacing[3], paddingTop: spacing[2] },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    minHeight: 32,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  pressed: { opacity: 0.6 },
  shopName: { flexShrink: 1, textAlign: 'right' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] },
});
