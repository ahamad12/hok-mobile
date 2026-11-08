import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { ListItem, ListSection } from '@/components/ListItem';
import { SkeletonRow } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import { useRemoveShopStaff } from '@/features/shops/api/shops.mutations';
import { useShopStaff } from '@/features/shops/api/shops.queries';
import {
  ScreenMode,
  ShopScreenFrame,
} from '@/features/shops/components/ShopScreenFrame';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

/** This shop's staff (OWNER/MANAGER). Business-wide people are on Team. */
export default function ShopStaffScreen({
  mode = 'pushed',
}: {
  mode?: ScreenMode;
}) {
  const router = useRouter();
  const shopId = useShopId();
  const { colors } = useColors();
  const toast = useToast();
  const confirm = useRef<ConfirmSheetRef>(null);
  const staff = useShopStaff(shopId);
  const removeStaff = useRemoveShopStaff(shopId);

  const invite = () =>
    router.push({ pathname: '/invite-member', params: { shopId } });

  return (
    <ShopScreenFrame
      mode={mode}
      title={mode === 'tab' ? 'Team' : 'Staff in this shop'}
      action={{ icon: 'UserPlus', label: 'Invite staff', onPress: invite }}>
      {staff.isLoading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : (staff.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon='UsersRound'
          title='No staff yet'
          body='Invite people to work in this shop. They join once they accept.'
        />
      ) : (
        <ListSection>
          {staff.data?.map((m) => (
            <ListItem
              key={m.id}
              leading={<Avatar name={m.displayName} />}
              title={m.displayName}
              subtitle={m.email}
              onPress={() =>
                router.push({
                  pathname: '/people/[userId]',
                  params: { userId: m.id },
                })
              }
              trailing={
                <IconButton
                  icon='UserMinus'
                  label={`Remove ${m.displayName}`}
                  size={36}
                  onPress={() =>
                    confirm.current?.ask({
                      title: `Remove ${m.displayName}?`,
                      message: `${m.displayName} will no longer be assigned to this shop.`,
                      confirmLabel: 'Remove',
                      icon: 'UserMinus',
                      onConfirm: () =>
                        removeStaff
                          .mutateAsync(m.id)
                          .then(() =>
                            toast.success(
                              `${m.displayName} removed from the shop`,
                            ),
                          ),
                    })
                  }
                  style={{ backgroundColor: colors.background.default }}
                />
              }>
              {m.isSupervisor ? (
                <View style={styles.chips}>
                  <Badge label='Supervisor' tone='info' icon='Star' />
                </View>
              ) : null}
            </ListItem>
          ))}
        </ListSection>
      )}
      <ConfirmSheet ref={confirm} />
    </ShopScreenFrame>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: spacing[1], marginTop: 4 },
});
