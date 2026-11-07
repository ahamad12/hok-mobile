import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, IconName } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { ListItem, ListSection } from '@/components/ListItem';
import { OptionSheet, OptionSheetRef } from '@/components/OptionSheet';
import { COLOR_THEME } from '@/constants';
import { useColors } from '@/contexts/ColorContext';
import { useLogout, useLogoutAll } from '@/features/auth/api/auth.mutations';
import { useSessions } from '@/features/auth/api/auth.queries';
import { useUser } from '@/features/auth/hooks/useAuth';
import { roleLabel } from '@/features/auth/utils/role';
import {
  useSelectedTheme,
  useSetColorTheme,
} from '@/store/selectors/appSelectors';
import {
  useLocale,
  useSetLocale,
} from '@/store/selectors/translationSelectors';
import { borderRadius, spacing } from '@/theme/Common';

const THEME_OPTIONS: {
  value: COLOR_THEME;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  {
    value: COLOR_THEME.LIGHT,
    label: 'Light',
    description: 'Always use light mode',
    icon: 'Sun',
  },
  {
    value: COLOR_THEME.DARK,
    label: 'Dark',
    description: 'Always use dark mode',
    icon: 'Moon',
  },
  {
    value: COLOR_THEME.SYSTEM_DEFAULT,
    label: 'System',
    description: 'Follow your device setting',
    icon: 'SunMoon',
  },
];

// Matches the bundles registered in src/i18n/index.ts.
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල', description: 'Sinhala' },
  { value: 'ta', label: 'தமிழ்', description: 'Tamil' },
  { value: 'zh-CN', label: '简体中文', description: 'Chinese (Simplified)' },
  { value: 'de', label: 'Deutsch', description: 'German' },
  { value: 'fr', label: 'Français', description: 'French' },
];

/** Avatar, name, email and role; opens the profile. */
export function AccountCard() {
  const router = useRouter();
  const { colors } = useColors();
  const user = useUser();
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      accessibilityRole='button'
      accessibilityLabel='Open profile'
      style={({ pressed }) => [
        styles.account,
        {
          backgroundColor: pressed
            ? colors.background.subtle
            : colors.background.surface,
        },
      ]}>
      <Avatar name={user?.displayName ?? user?.email} size='lg' solid />
      <View style={styles.flex}>
        <AppText variant='h6' numberOfLines={1}>
          {user?.displayName}
        </AppText>
        <AppText variant='bodySmall' color='secondary' numberOfLines={1}>
          {user?.email}
        </AppText>
        {user ? (
          <AppText variant='caption' color='tertiary' weight='semibold'>
            {roleLabel(user.role)}
            {user.isSupervisor ? ' · Supervisor' : ''}
          </AppText>
        ) : null}
      </View>
      <AppIcon name='ChevronRight' size={18} color={colors.icon.tertiary} />
    </Pressable>
  );
}

/**
 * Profile, security, preferences and sign-out. Shown on the Account tab
 * and, for staff (who have no business level), in a shop's More tab.
 */
export function AccountSections({
  showVersion = true,
}: {
  showVersion?: boolean;
}) {
  const router = useRouter();
  const theme = useSelectedTheme();
  const setTheme = useSetColorTheme();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const sessions = useSessions();
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const themeSheet = useRef<OptionSheetRef>(null);
  const languageSheet = useRef<OptionSheetRef>(null);
  const confirm = useRef<ConfirmSheetRef>(null);

  const themeInfo =
    THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[2];
  const language =
    LANGUAGES.find((l) => l.value === locale) ??
    LANGUAGES.find((l) => locale?.startsWith(l.value)) ??
    LANGUAGES[0];
  const deviceCount = sessions.data?.length;
  const version = Constants.expoConfig?.version ?? '';

  return (
    <>
      <ListSection title='Account'>
        <ListItem
          icon='UserRound'
          title='Profile'
          subtitle='Name and username'
          onPress={() => router.push('/profile')}
        />
        <ListItem
          icon='KeyRound'
          title='Change password'
          onPress={() => router.push('/change-password')}
        />
        <ListItem
          icon='MonitorSmartphone'
          title='Sessions & devices'
          subtitle='Review and sign out sessions'
          value={deviceCount !== undefined ? String(deviceCount) : undefined}
          onPress={() => router.push('/devices')}
        />
      </ListSection>

      <ListSection title='Preferences'>
        <ListItem
          icon={themeInfo.icon}
          title='Appearance'
          value={themeInfo.label}
          onPress={() => themeSheet.current?.open()}
        />
        <ListItem
          icon='Languages'
          title='Language'
          value={language.label}
          onPress={() => languageSheet.current?.open()}
        />
      </ListSection>

      <ListSection title='Session'>
        <ListItem
          icon='LogOut'
          title='Sign out'
          subtitle='Sign out on this device'
          onPress={() =>
            confirm.current?.ask({
              title: 'Sign out?',
              message: 'You can sign back in any time.',
              confirmLabel: 'Sign out',
              icon: 'LogOut',
              onConfirm: () => logout.mutateAsync(),
            })
          }
          chevron={false}
        />
        <ListItem
          icon='ShieldOff'
          title='Sign out everywhere'
          subtitle='Ends every session, this one included'
          destructive
          onPress={() =>
            confirm.current?.ask({
              title: 'Sign out everywhere?',
              message:
                'Every device signed in to your account, including this one, will be signed out.',
              confirmLabel: 'Sign out all',
              icon: 'ShieldOff',
              onConfirm: () => logoutAll.mutateAsync(),
            })
          }
          chevron={false}
        />
      </ListSection>

      {showVersion ? (
        <AppText variant='caption' color='tertiary' align='center'>
          {`Hok${version ? ` · v${version}` : ''}`}
        </AppText>
      ) : null}

      <OptionSheet
        ref={themeSheet}
        title='Appearance'
        subtitle='Choose how Hok looks'
        options={THEME_OPTIONS}
        value={theme}
        onSelect={(v) => setTheme(v)}
      />
      <OptionSheet
        ref={languageSheet}
        title='Language'
        subtitle='Screens without a translation stay in English'
        options={LANGUAGES}
        value={language.value}
        onSelect={(v) => setLocale(v)}
      />
      <ConfirmSheet ref={confirm} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.xl,
  },
});
