import { useRouter } from 'expo-router';
import React, { useRef } from 'react';

import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { ListItem, ListSection } from '@/components/ListItem';
import {
  AccountCard,
  AccountSections,
} from '@/features/auth/components/AccountSections';
import { useLicenses } from '@/features/licenses/api/licenses.queries';
import { useDeleteShop } from '@/features/shops/api/shops.mutations';
import { useShopStaff } from '@/features/shops/api/shops.queries';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import {
  useCapabilities,
  useCurrentShop,
} from '@/features/shops/hooks/useShopContext';
import { formatShopAddress } from '@/features/shops/utils/shopUtils';
import { useToast } from '@/hooks/useToast';

/**
 * The fifth tab on every bar. What it holds depends on the role:
 * - owners/managers: this shop's people and settings, then the business
 *   (all hoks, team and invites), so the business level is always one tap
 *   away whatever the shop count;
 * - supervisors: Scratch, Licences, Forms;
 * - staff: Forms.
 * Everyone ends with their account.
 */
export default function MoreScreen() {
  const router = useRouter();
  const { shopId, shop } = useCurrentShop();
  const caps = useCapabilities();
  const manages = caps.shell === 'oversight';
  const toast = useToast();
  const confirm = useRef<ConfirmSheetRef>(null);
  const remove = useDeleteShop();

  const staff = useShopStaff(manages ? shopId : '');
  const licences = useLicenses(caps.canViewLicenses ? shopId : '');
  const expiring = (licences.data?.licenses ?? []).filter(
    (l) => l.isExpired || l.isExpiringSoon,
  ).length;

  const go = (path: string) =>
    router.push({ pathname: `/shop/[shopId]/${path}`, params: { shopId } });

  const deleteShop = () => {
    if (!shop) return;
    confirm.current?.ask({
      title: `Delete ${shop.name}?`,
      message:
        'The shop disappears for you and your team. Its records are kept on the server.',
      confirmLabel: 'Delete shop',
      icon: 'Trash2',
      onConfirm: () =>
        remove.mutateAsync(shop.id).then(() => {
          toast.success(`${shop.name} deleted`);
          router.dismissTo('/shops');
        }),
    });
  };

  return (
    <ShopTabScreen title='More'>
      {manages ? (
        <ListSection title='This shop'>
          <ListItem
            icon='UsersRound'
            title='Staff in this shop'
            value={staff.data ? String(staff.data.length) : undefined}
            onPress={() => go('staff')}
          />
          <ListItem
            icon='Ticket'
            title='Scratch games'
            subtitle='Games this hok sells'
            onPress={() => go('scratch/games')}
          />
          {caps.canManageShop ? (
            <ListItem
              icon='PencilLine'
              title='Edit shop'
              subtitle={shop ? formatShopAddress(shop.address) : undefined}
              onPress={() => go('edit')}
            />
          ) : null}
          {caps.canManageShop ? (
            <ListItem
              icon='Trash2'
              title='Delete shop'
              subtitle='Remove it for everyone'
              destructive
              onPress={deleteShop}
              chevron={false}
            />
          ) : null}
        </ListSection>
      ) : (
        <ListSection title='Shop'>
          {caps.bar === 'supervisor' ? (
            <ListItem
              icon='Ticket'
              title='Scratch'
              subtitle='Packs, scans and sales'
              onPress={() => go('records/scratch')}
            />
          ) : null}
          {caps.canViewLicenses ? (
            <ListItem
              icon='BadgeCheck'
              title='Licences'
              value={expiring ? `${expiring} need renewal` : undefined}
              onPress={() => go('licenses')}
            />
          ) : null}
          <ListItem
            icon='ClipboardList'
            title='Forms'
            subtitle='Checklists and reports to fill in'
            onPress={() => go('forms')}
          />
        </ListSection>
      )}

      {manages ? (
        <ListSection title='Business'>
          <ListItem
            icon='Store'
            title='All hoks'
            subtitle='Switch shop or see them side by side'
            onPress={() => router.push('/shops')}
          />
          {caps.canManageShop ? (
            <ListItem
              icon='Plus'
              title='Open a new hok'
              onPress={() => router.push('/shop/new')}
            />
          ) : null}
          <ListItem
            icon='UsersRound'
            title='Team & invites'
            subtitle='Everyone across your hoks'
            onPress={() => router.push('/team')}
          />
        </ListSection>
      ) : null}

      <AccountCard />
      <AccountSections />
      <ConfirmSheet ref={confirm} />
    </ShopTabScreen>
  );
}
