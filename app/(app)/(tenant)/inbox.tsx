import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { useTabBarInset } from '@/components/FloatingTabBar';
import { IconTileTone, ListItem, ListSection } from '@/components/ListItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SkeletonRow } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import {
  buildSampleInbox,
  InboxItem,
  InboxSeverity,
} from '@/features/inbox/inbox.mock';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { borderRadius, spacing } from '@/theme/Common';

type Scope = 'all' | 'mine';

const TONE: Record<InboxSeverity, IconTileTone> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

/**
 * What needs attention across every shop, busiest shop first. Tapping an
 * item opens that shop on the tab where it is handled.
 *
 * SAMPLE DATA: the items come from inbox.mock.ts until tapt-api has a
 * tenant-wide attention endpoint. The shops are real.
 */
export default function InboxScreen() {
  const router = useRouter();
  const { colors } = useColors();
  const bottom = useTabBarInset();
  const shops = useMyShops();
  const [scope, setScope] = useState<Scope>('all');

  const groups = useMemo(
    () => buildSampleInbox(shops.data ?? [], scope === 'mine'),
    [shops.data, scope],
  );

  const open = (item: InboxItem) => {
    if (item.target === 'licenses') {
      router.push({
        pathname: '/shop/[shopId]/licenses',
        params: { shopId: item.shopId },
      });
      return;
    }
    router.push({
      pathname: `/shop/[shopId]/${item.target}`,
      params: { shopId: item.shopId },
    });
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: bottom }]}>
        <ScreenHeader
          title='Inbox'
          subtitle='Needs attention across your shops'
        />

        <View
          style={[
            styles.notice,
            { backgroundColor: colors.background.infoSubtle },
          ]}>
          <Badge label='Sample data' tone='info' />
          <AppText variant='caption' color='secondary' style={styles.flex}>
            Shops are real. Items are examples until the server can report
            alerts across shops.
          </AppText>
        </View>

        <SegmentedControl<Scope>
          value={scope}
          onChange={setScope}
          options={[
            { value: 'all', label: 'All' },
            { value: 'mine', label: 'Mine' },
          ]}
        />

        {shops.isLoading ? (
          <ListSection>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </ListSection>
        ) : groups.length === 0 ? (
          <EmptyState
            icon='CircleCheckBig'
            title='All clear across your shops'
            body={
              scope === 'mine'
                ? 'Nothing is assigned to you right now.'
                : 'Nothing needs attention right now.'
            }
          />
        ) : (
          groups.map((g) => (
            <ListSection
              key={g.shop.id}
              title={g.shop.name}
              action={<Badge label={String(g.items.length)} tone='inverse' />}>
              {g.items.map((item) => (
                <ListItem
                  key={item.id}
                  icon={item.icon}
                  iconTone={TONE[item.severity]}
                  title={item.title}
                  subtitle={item.detail}
                  onPress={() => open(item)}
                />
              ))}
            </ListSection>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[5], gap: spacing[5] },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.lg,
  },
});
