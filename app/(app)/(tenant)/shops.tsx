import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { useTabBarInset } from '@/components/FloatingTabBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonCard } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { Shop } from '@/features/shops/api/shops.types';
import { ShopCard } from '@/features/shops/components/ShopCard';
import { filterShops } from '@/features/shops/utils/shopUtils';
import { spacing } from '@/theme/Common';

function greeting(name?: string) {
  const h = new Date().getHours();
  const part =
    h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const first = name?.split(' ')[0];
  return first ? `${part}, ${first}` : part;
}

// A business with exactly one shop lands inside it, once per app launch;
// "All shops" brings the owner back here.
let autoOpened = false;

/**
 * All Shops (owners and managers; staff never reach the business level).
 * `GET /shops/my` returns every active shop of the business.
 */
export default function ShopsScreen() {
  const router = useRouter();
  const user = useUser();
  const { colors } = useColors();
  const bottom = useTabBarInset();
  const isOwner = user?.role === 'OWNER';

  const list = useMyShops();
  const data: Shop[] = useMemo(() => list.data ?? [], [list.data]);

  const [query, setQuery] = useState('');
  const shops = useMemo(() => filterShops(data, query), [data, query]);

  const openShop = (s: Shop) =>
    router.push({ pathname: '/shop/[shopId]/home', params: { shopId: s.id } });
  const addShop = () => router.push('/shop/new');
  const loading = list.isLoading;

  useEffect(() => {
    if (!autoOpened && list.isSuccess && data.length === 1) {
      autoOpened = true;
      openShop(data[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.isSuccess, data]);

  const header = (
    <View style={styles.headerBlock}>
      <ScreenHeader
        eyebrow={greeting(user?.displayName)}
        title='Shops'
        actionIcon={isOwner ? 'Plus' : undefined}
        actionLabel='Add a shop'
        onAction={isOwner ? addShop : undefined}
      />
      {data.length > 1 ? (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder='Search shops, cities, phone'
        />
      ) : null}
      {data.length > 0 ? (
        <AppText variant='label' color='tertiary' style={styles.count}>
          {query
            ? `${shops.length} of ${data.length} shops`
            : `${data.length} ${data.length === 1 ? 'shop' : 'shops'}`}
        </AppText>
      ) : null}
    </View>
  );

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
      <EmptyState
        icon='Store'
        title='Add your first shop'
        body='Shops are where your team works. Add one to start inviting staff.'
        actionLabel='Add a shop'
        actionIcon='Plus'
        onAction={addShop}
      />
    ) : (
      <EmptyState
        icon='Store'
        title='No shops yet'
        body='Your owner has not added any shops yet.'
      />
    )
  ) : (
    <EmptyState
      icon='SearchX'
      title='No matching shops'
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
          <ShopCard shop={item} onPress={() => openShop(item)} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={[styles.pad, { paddingBottom: bottom }]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[5] },
  headerBlock: { gap: spacing[4], marginBottom: spacing[5] },
  count: { paddingHorizontal: spacing[1] },
});
