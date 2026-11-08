import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

import { AppText } from './AppText';

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  /** 'page' for tab screens, 'form' for forms and wizard steps. */
  size?: 'page' | 'form';
  style?: ViewStyle;
}

const SIZE = { page: 34, form: 28 } as const;

/**
 * Page heading in the logo's manner: heavy, upright capitals set tight, led
 * by the rust strike from the H of HOK.
 */
export function PageTitle({
  title,
  subtitle,
  size = 'page',
  style,
}: PageTitleProps) {
  const fontSize = SIZE[size];
  const strike = Math.round(fontSize * 0.62);

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <Svg
          width={strike}
          height={strike}
          viewBox='0 0 20 20'
          style={{ marginTop: fontSize * 0.14 }}>
          <Path
            d='M1 17L19 4'
            stroke={palette.hok.rust}
            strokeWidth={4.5}
            fill='none'
          />
        </Svg>
        <AppText
          weight='extrabold'
          accessibilityRole='header'
          numberOfLines={2}
          style={[
            styles.text,
            { fontSize, lineHeight: Math.round(fontSize * 1.06) },
          ]}>
          {title.toUpperCase()}
        </AppText>
      </View>
      {subtitle ? (
        <AppText variant='body' color='secondary'>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[2] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  text: { flex: 1, letterSpacing: -0.4 },
});
