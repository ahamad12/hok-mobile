import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NetworkStatus } from '@/constants/AppConstants';
import { useColors } from '@/contexts/ColorContext';
import { useAppState } from '@/store/selectors/appSelectors';
import { palette } from '@/theme/Colors';
import { spacing } from '@/theme/Common';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

const timeOf = (d: Date) =>
  d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/**
 * Shown only while offline: says the figures are from the last time the
 * app was online. Queries pause and refetch on reconnect (onlineManager).
 */
export function OfflineBanner() {
  const { colors } = useColors();
  const online = useAppState((s) => s.networkStatus !== NetworkStatus.OFFLINE);
  const [lastOnline, setLastOnline] = useState(() => new Date());

  useEffect(() => {
    if (online) setLastOnline(new Date());
  }, [online]);

  if (online) return null;
  return (
    <View
      accessibilityRole='alert'
      style={[styles.bar, { backgroundColor: colors.background.surface }]}>
      <AppIcon name='CloudOff' size={16} color={palette.hok.rust} />
      <AppText variant='bodySmall' color='secondary' style={styles.flex}>
        {`Offline · showing what loaded at ${timeOf(lastOnline)}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: palette.hok.rust,
  },
});
