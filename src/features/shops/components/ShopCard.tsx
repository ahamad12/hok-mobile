import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { useColors } from '@/contexts/ColorContext';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

import { Shop } from '../api/shops.types';
import { CloseStatus } from '../utils/closeStatus';
import { formatShopLocation } from '../utils/shopUtils';
import { ShopCover } from './ShopCover';

export { ShopCover } from './ShopCover';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 15, stiffness: 380, mass: 0.8 } as const;

type CardShop = Pick<Shop, 'name' | 'logoUrl' | 'phone' | 'address'> & {
  id?: string;
};

/**
 * A hok as a listing: its carved cover, then the name and where it stands.
 * No chrome; the whole card is the press target. Without onPress it is a
 * still preview (the create wizard's review step).
 */
export function ShopCard({
  shop,
  onPress,
  status,
}: {
  shop: CardShop;
  onPress?: () => void;
  /** The week's closes and a one-line status (Your hoks). */
  status?: CloseStatus;
}) {
  const { colors } = useColors();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const location = formatShopLocation(shop.address);
  const meta = [location, shop.phone].filter(Boolean).join('  ·  ');

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      onPressIn={() => (scale.value = withSpring(0.985, SPRING))}
      onPressOut={() => (scale.value = withSpring(1, SPRING))}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${shop.name}${location ? `, ${location}` : ''}`}
      style={[styles.card, anim]}>
      <ShopCover shop={shop} />
      <View style={styles.body}>
        <AppText variant='h5' numberOfLines={1}>
          {shop.name || 'Your hok'}
        </AppText>
        {meta ? (
          <AppText variant='body' color='secondary' numberOfLines={1}>
            {meta}
          </AppText>
        ) : null}
        {status ? (
          <View
            style={styles.status}
            accessibilityLabel={`${status.line}. ${status.week.filter((d) => d === 'closed').length} of the last 7 days closed.`}>
            <View style={styles.week}>
              {status.week.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.mark,
                    {
                      backgroundColor:
                        d === 'closed'
                          ? colors.text.primary
                          : d === 'draft'
                            ? palette.hok.rust
                            : colors.border.subtle,
                    },
                  ]}
                />
              ))}
            </View>
            <AppText
              variant='bodySmall'
              customColor={status.behind ? palette.hok.rust : undefined}
              color={status.behind ? undefined : 'secondary'}
              numberOfLines={1}>
              {status.line}
            </AppText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing[8] },
  body: { paddingTop: spacing[4], gap: spacing[1] },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  week: { flexDirection: 'row', gap: 3 },
  mark: { width: 8, height: 8 },
});
