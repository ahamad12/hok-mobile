import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { useColors } from '@/contexts/ColorContext';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';
import { getInitials } from '@/utils/initials';

import { Shop } from '../api/shops.types';

const { ink, bone, rust } = palette.hok;

/** Small deterministic PRNG so a shop always gets the same board. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

type Board = { marks: string; cut: string };

/**
 * A tally board carved for this shop: two rows of stave groups across the
 * top of the plank, every fifth struck through, and one fresh rust cut.
 */
function carveBoard(seed: string): Board {
  const rnd = seeded(seed);
  const marks: string[] = [];
  const all: string[] = [];
  [10, 34].forEach((y0) => {
    let x = 8;
    while (x < 108) {
      const n = 1 + Math.floor(rnd() * 5);
      const h = 14 + Math.round(rnd() * 6);
      const start = x;
      for (let k = 0; k < n && x < 112; k++) {
        const d = `M${x} ${y0}V${y0 + h}`;
        marks.push(d);
        all.push(d);
        x += 5;
      }
      if (n === 5) {
        const d = `M${start - 3} ${y0 + h - 3}L${x - 2} ${y0 + 3}`;
        marks.push(d);
        all.push(d);
      }
      x += 7 + Math.round(rnd() * 6);
    }
  });
  const cutIndex = Math.floor(rnd() * all.length);
  // eslint-disable-next-line security/detect-object-injection
  const cut = all[cutIndex] ?? '';
  return { marks: marks.filter((m) => m !== cut).join(''), cut };
}

/**
 * A shop's cover: its logo, or its own carved tally board with the shop's
 * initials set large in the corner. Square, 4:3 by default.
 */
export function ShopCover({
  shop,
  height,
  aspectRatio,
}: {
  shop: Pick<Shop, 'name' | 'logoUrl'> & { id?: string };
  height?: number;
  aspectRatio?: number;
}) {
  const { colors } = useColors();
  const [failed, setFailed] = useState(false);
  const sizeStyle = height ? { height } : { aspectRatio: aspectRatio ?? 4 / 3 };
  const board = useMemo(
    () => carveBoard(shop.id ?? (shop.name || 'hok')),
    [shop.id, shop.name],
  );

  if (shop.logoUrl && !failed) {
    return (
      <Image
        source={{ uri: shop.logoUrl }}
        onError={() => setFailed(true)}
        style={[styles.cover, sizeStyle]}
        accessibilityIgnoresInvertColors
      />
    );
  }

  const dark = colors.isDark;
  const ground = dark ? '#1C1C1A' : bone;
  const carve = dark ? bone : ink;

  return (
    <View
      style={[styles.cover, sizeStyle, { backgroundColor: ground }]}
      accessibilityElementsHidden
      importantForAccessibility='no-hide-descendants'>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox='0 0 120 90'
        preserveAspectRatio='xMidYMid slice'>
        <Path
          d={board.marks}
          stroke={carve}
          strokeOpacity={0.16}
          strokeWidth={2.2}
          fill='none'
        />
        <Path d={board.cut} stroke={rust} strokeWidth={2.6} fill='none' />
      </Svg>
      <AppText
        weight='extrabold'
        customColor={carve}
        style={styles.initials}
        maxFontSizeMultiplier={1}>
        {getInitials(shop.name) || 'H'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', overflow: 'hidden' },
  initials: {
    position: 'absolute',
    left: spacing[5],
    bottom: spacing[3],
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
});
