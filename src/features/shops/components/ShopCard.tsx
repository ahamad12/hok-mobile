import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';
import { getInitials } from '@/utils/initials';

import { Shop } from '../api/shops.types';
import { formatShopLocation } from '../utils/shopUtils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 15, stiffness: 380, mass: 0.8 } as const;

/** A shop's cover: its logo, or a large monogram on a tonal surface. */
export function ShopCover({
  shop,
  height,
  aspectRatio,
  rounded = true,
}: {
  shop: Pick<Shop, 'name' | 'logoUrl'>;
  height?: number;
  aspectRatio?: number;
  rounded?: boolean;
}) {
  const { colors } = useColors();
  const [failed, setFailed] = useState(false);
  const radius = rounded ? borderRadius['2xl'] : 0;
  const sizeStyle = height ? { height } : { aspectRatio: aspectRatio ?? 4 / 3 };

  if (shop.logoUrl && !failed) {
    return (
      <Image
        source={{ uri: shop.logoUrl }}
        onError={() => setFailed(true)}
        style={[styles.cover, sizeStyle, { borderRadius: radius }]}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[
        styles.cover,
        styles.placeholder,
        sizeStyle,
        { borderRadius: radius, backgroundColor: colors.background.surface },
      ]}>
      <AppText
        weight='extrabold'
        customColor={colors.text.primary}
        style={styles.monogram}
        maxFontSizeMultiplier={1}>
        {getInitials(shop.name)}
      </AppText>
      <View style={styles.storeMark}>
        <AppIcon
          name='Store'
          size={16}
          color={colors.icon.tertiary}
          strokeWidth={1.8}
        />
      </View>
    </View>
  );
}

/** Airbnb-style listing card: big cover, then name and meta. No chrome. */
export function ShopCard({
  shop,
  onPress,
}: {
  shop: Shop;
  onPress: () => void;
}) {
  const { colors } = useColors();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const location = formatShopLocation(shop.address);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.98, SPRING))}
      onPressOut={() => (scale.value = withSpring(1, SPRING))}
      accessibilityRole='button'
      accessibilityLabel={`${shop.name}${location ? `, ${location}` : ''}`}
      style={[styles.card, anim]}>
      <ShopCover shop={shop} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant='h6' numberOfLines={1} style={styles.flex}>
            {shop.name}
          </AppText>
          <AppIcon name='ArrowUpRight' size={18} color={colors.icon.tertiary} />
        </View>
        <AppText variant='bodySmall' color='secondary' numberOfLines={1}>
          {[location, shop.phone].filter(Boolean).join('  ·  ')}
        </AppText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: spacing[8] },
  cover: { width: '100%', overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  monogram: { fontSize: 56, lineHeight: 64, letterSpacing: -2 },
  storeMark: { position: 'absolute', left: spacing[4], bottom: spacing[4] },
  body: { paddingTop: spacing[3], gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
});
