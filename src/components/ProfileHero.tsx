import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/Common';

import { AppText } from './AppText';
import { Avatar } from './Avatar';

export interface ProfileHeroProps {
  name?: string | null;
  email?: string | null;
  /** Chips row under the email. */
  children?: React.ReactNode;
}

/** Centered avatar + name block on the plain page background. */
export const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  email,
  children,
}) => (
  <View style={styles.wrap}>
    <Avatar name={name ?? email} size='xl' solid />
    <View style={styles.text}>
      <AppText variant='h3' align='center' accessibilityRole='header'>
        {name ?? ' '}
      </AppText>
      {email ? (
        <AppText variant='bodySmall' color='secondary' align='center'>
          {email}
        </AppText>
      ) : null}
    </View>
    {children ? <View style={styles.chips}>{children}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: spacing[6],
    paddingBottom: spacing[2],
    gap: spacing[4],
  },
  text: { alignItems: 'center', gap: 2 },
  chips: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
