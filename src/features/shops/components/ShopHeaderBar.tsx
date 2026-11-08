import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { IconButton } from '@/components/IconButton';
import { OptionSheet, OptionSheetRef } from '@/components/OptionSheet';
import { useColors } from '@/contexts/ColorContext';
import { useUser } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

import { useUpdateShop } from '../api/shops.mutations';
import { useMyShops } from '../api/shops.queries';
import {
  useCapabilities,
  useCurrentShop,
  useShopId,
  useShopRole,
} from '../hooks/useShopContext';

const ALL = '__all__';
type MenuAction = 'edit' | 'deactivate';

/**
 * Top row inside a shop.
 * - Managers: "‹ All hoks", the shop name (▾ opens the switcher when there
 *   are 2+ shops), the owner's ⋯ menu, and the avatar.
 * - Staff: the shop name and the avatar only. A locked control is worse
 *   than none.
 * - Pushed screens: "‹ Back" and the shop name.
 */
export function ShopHeaderBar({ pushed = false }: { pushed?: boolean }) {
  const router = useRouter();
  const { colors } = useColors();
  const toast = useToast();
  const user = useUser();
  const shopId = useShopId();
  const { shop } = useCurrentShop();
  const { hasTenantLevel } = useShopRole();
  const caps = useCapabilities();
  const mine = useMyShops();
  const update = useUpdateShop(shopId);
  const switcher = useRef<OptionSheetRef>(null);
  const menu = useRef<OptionSheetRef>(null);
  const confirm = useRef<ConfirmSheetRef>(null);

  const goAllHoks = () =>
    router.canDismiss() ? router.dismissTo('/shops') : router.replace('/shops');

  // Swap the shop stack rather than stacking a second shop on top.
  const switchTo = (id: string) => {
    if (id === ALL) {
      goAllHoks();
    } else if (id !== shopId) {
      router.replace({ pathname: '/shop/[shopId]', params: { shopId: id } });
    }
  };

  const onMenu = (a: MenuAction) => {
    if (a === 'edit') {
      router.push({ pathname: '/shop/[shopId]/edit', params: { shopId } });
      return;
    }
    confirm.current?.ask({
      title: `Deactivate ${shop?.name ?? 'this hok'}?`,
      message:
        'It leaves your hoks and staff lose access to it. Its records are kept.',
      confirmLabel: 'Deactivate',
      destructive: true,
      icon: 'Archive',
      onConfirm: () =>
        update.mutateAsync(
          { isActive: false },
          {
            onSuccess: () => {
              toast.success('Hok deactivated');
              goAllHoks();
            },
          },
        ),
    });
  };

  const canSwitch = !pushed && caps.canSwitchShop;
  const name = shop?.name ?? '';

  return (
    <View style={styles.row}>
      {pushed || hasTenantLevel ? (
        <Pressable
          onPress={pushed ? () => router.back() : goAllHoks}
          hitSlop={10}
          accessibilityRole='button'
          accessibilityLabel={pushed ? 'Back' : 'All hoks'}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <AppIcon name='ChevronLeft' size={18} color={colors.text.secondary} />
          <AppText variant='label' color='secondary'>
            {pushed ? 'Back' : 'All hoks'}
          </AppText>
        </Pressable>
      ) : null}

      <Pressable
        onPress={canSwitch ? () => switcher.current?.open() : undefined}
        disabled={!canSwitch}
        accessibilityRole={canSwitch ? 'button' : 'text'}
        accessibilityLabel={canSwitch ? `${name}, switch hok` : name}
        style={styles.name}>
        <AppText
          variant='label'
          color={pushed || hasTenantLevel ? 'tertiary' : 'secondary'}
          numberOfLines={1}
          style={styles.shrink}>
          {name}
        </AppText>
        {canSwitch ? (
          <AppIcon name='ChevronDown' size={16} color={colors.text.tertiary} />
        ) : null}
      </Pressable>

      {!pushed && caps.canManageShop ? (
        <IconButton
          icon='Ellipsis'
          label='Hok settings'
          onPress={() => menu.current?.open()}
          variant='surface'
        />
      ) : null}
      {!pushed ? (
        <Pressable
          onPress={() => router.push('/me')}
          hitSlop={8}
          accessibilityRole='button'
          accessibilityLabel='Your account'>
          <Avatar name={user?.displayName ?? user?.email} size='sm' solid />
        </Pressable>
      ) : null}

      <OptionSheet<string>
        ref={switcher}
        title='Switch hok'
        value={shopId}
        options={[
          { value: ALL, label: 'All hoks', icon: 'LayoutGrid' },
          ...(mine.data ?? []).map((s) => ({
            value: s.id,
            label: s.name,
            description: s.address.city,
            icon: 'Store' as const,
          })),
        ]}
        onSelect={switchTo}
      />
      <OptionSheet<MenuAction>
        ref={menu}
        title={name || 'Hok settings'}
        options={[
          { value: 'edit', label: 'Edit details', icon: 'Pencil' },
          { value: 'deactivate', label: 'Deactivate hok', icon: 'Archive' },
        ]}
        onSelect={onMenu}
      />
      <ConfirmSheet ref={confirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 44,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  pressed: { opacity: 0.6 },
  name: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  shrink: { flexShrink: 1 },
});
