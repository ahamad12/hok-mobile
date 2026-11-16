import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { useTabBarInset } from '@/components/FloatingTabBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonCard } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useShopsDailySummaries } from '@/features/money/api/money.queries';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { Shop } from '@/features/shops/api/shops.types';
import { ShopCard, ShopCover } from '@/features/shops/components/ShopCard';
import { closeStatus } from '@/features/shops/utils/closeStatus';
import { filterShops } from '@/features/shops/utils/shopUtils';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';
import { today } from '@/utils/businessDate';

function greeting(name?: string) {
  const h = new Date().getHours();
  const part =
    h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const first = name?.split(' ')[0];
  return first ? `${part}, ${first}` : part;
}

/**
 * Your hoks (owners and managers; staff never reach the business level).
 * `GET /shops/my` returns every active shop of the business. One-shop
 * businesses open straight into their shop from app/index.tsx.
 */
export default function ShopsScreen() {
  const router = useRouter();
  const user = useUser();
  const { colors } = useColors();
  const bottom = useTabBarInset();
  const isOwner = user?.role === 'OWNER';

  const list = useMyShops();
  const data: Shop[] = useMemo(() => list.data ?? [], [list.data]);

  // Each hok's close record, derived from its recent daily summaries.
  const summaries = useShopsDailySummaries(data.map((s) => s.id));
  const day = today();
  const statusById = new Map(
    data.map((s, i) => [
      s.id,
      // eslint-disable-next-line security/detect-object-injection
      summaries[i]?.data
        ? // eslint-disable-next-line security/detect-object-injection
          closeStatus(summaries[i].data!.summaries, day)
        : undefined,
    ]),
  );
  const behindCount = [...statusById.values()].filter((s) => s?.behind).length;

  const [query, setQuery] = useState('');
  const [show, setShow] = useState<'all' | 'behind'>('all');
  const shops = useMemo(
    () =>
      filterShops(data, query).filter(
        (s) => show === 'all' || statusById.get(s.id)?.behind,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, query, show, behindCount],
  );

  const openShop = (s: Shop) =>
    router.push({ pathname: '/shop/[shopId]', params: { shopId: s.id } });
  const addShop = () => router.push('/shop/new');
  const loading = list.isLoading;

  const countLabel = (n: number) => `${n} ${n === 1 ? 'hok' : 'hoks'}`;
  const subtitle =
    data.length > 0
      ? `${greeting(user?.displayName)} · ${
          query
            ? `${shops.length} of ${countLabel(data.length)}`
            : countLabel(data.length)
        }${behindCount ? ` · ${behindCount} not closed` : ''}`
      : greeting(user?.displayName);

  const header = (
    <View style={styles.headerBlock}>
      <ScreenHeader title='Your hoks' subtitle={subtitle} />
      {data.length > 1 ? (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder='Search by name, city or phone'
        />
      ) : null}
      {data.length > 1 && behindCount > 0 ? (
        <FilterChips<'all' | 'behind'>
          value={show}
          onChange={setShow}
          options={[
            { value: 'all', label: 'All' },
            { value: 'behind', label: `Not closed · ${behindCount}` },
          ]}
        />
      ) : null}
    </View>
  );

  // Owners with shops get the floating add button; the empty state has its own.
  const showAdd = isOwner && data.length > 0;

  const empty = loading ? (
    <>
      <SkeletonCard />
      <SkeletonCard />
    </>
  ) : list.isError ? (
    <EmptyState
      icon='CloudOff'
      title="Couldn't load shops"
      body='Check your connection and pull down to try again.'
      actionLabel='Try again'
      onAction={() => list.refetch()}
    />
  ) : data.length === 0 ? (
    isOwner ? (
      <View style={styles.firstHok}>
        <ShopCover shop={{ name: 'H', logoUrl: null, id: user?.id }} />
        <View style={styles.firstText}>
          <AppText variant='h5'>Carve your first hok</AppText>
          <AppText variant='body' color='secondary'>
            A hok is one of your shops. Add it, then invite the people who run
            it.
          </AppText>
        </View>
        <AppButton variant='brand' size='lg' fullWidth onPress={addShop}>
          Add your first hok
        </AppButton>
      </View>
    ) : (
      <EmptyState
        icon='Store'
        title='No hoks yet'
        body='Your owner has not added any shops yet.'
      />
    )
  ) : (
    <EmptyState
      icon='SearchX'
      title='Nothing matches'
      body='Try a different name, city or phone number.'
    />
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <FlatList
        data={shops}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <ShopCard
            shop={item}
            status={statusById.get(item.id)}
            onPress={() => openShop(item)}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={[
          styles.pad,
          // Keep the last card clear of the floating add button.
          { paddingBottom: bottom + (showAdd ? FAB + spacing[4] : 0) },
        ]}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
        refreshControl={
          <RefreshControl
            refreshing={list.isRefetching}
            onRefresh={() => list.refetch()}
            tintColor={colors.text.primary}
          />
        }
      />
      {showAdd ? (
        <Pressable
          onPress={addShop}
          accessibilityRole='button'
          accessibilityLabel='Open another hok'
          style={({ pressed }) => [
            styles.fab,
            {
              bottom,
              backgroundColor: pressed ? RUST_PRESSED : palette.hok.rust,
            },
          ]}>
          <AppIcon name='Plus' size={26} color='#FFFFFF' strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const FAB = 56;
const RUST_PRESSED = '#A33A16';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[6] },
  headerBlock: { gap: spacing[5], marginBottom: spacing[8] },
  firstHok: { gap: spacing[5] },
  firstText: { gap: spacing[2] },
  // Square rust button, the one accent on the screen; it floats above the
  // tab bar, so it is the one thing here with a shadow.
  fab: {
    position: 'absolute',
    right: spacing[6],
    width: FAB,
    height: FAB,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
