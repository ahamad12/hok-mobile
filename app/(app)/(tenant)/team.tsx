import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { useTabBarInset } from '@/components/FloatingTabBar';
import { ListItem, ListSection } from '@/components/ListItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SkeletonRow } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import {
  useResendInvitation,
  useRevokeInvitation,
} from '@/features/auth/api/auth.mutations';
import { usePendingInvitations } from '@/features/auth/api/auth.queries';
import { Invitation } from '@/features/auth/api/auth.types';
import { useUser } from '@/features/auth/hooks/useAuth';
import { roleLabel } from '@/features/auth/utils/role';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { useTeamMembers } from '@/features/team/api/team.queries';
import { TeamMember } from '@/features/team/api/team.types';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { daysUntil, formatExpiry, formatRelativeTime } from '@/utils/time';

type Segment = 'members' | 'pending';
const ALL = '__all__';

/**
 * Everyone in the business (GET /team/members) and pending invitations.
 * Managers are business-wide, so they see every shop's people too.
 */
export default function TeamScreen() {
  const router = useRouter();
  const user = useUser();
  const { colors } = useColors();
  const bottom = useTabBarInset();
  const toast = useToast();

  const team = useTeamMembers();
  const invites = usePendingInvitations();
  const shops = useMyShops().data ?? [];
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();

  const [segment, setSegment] = useState<Segment>('members');
  const [shopFilter, setShopFilter] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Invitation | null>(null);
  const actions = useRef<AppBottomSheetRef>(null);
  const confirm = useRef<ConfirmSheetRef>(null);

  const shopName = (id: string | null) =>
    id ? (shops.find((s) => s.id === id)?.name ?? 'Unknown shop') : null;

  const members = team.data ?? [];
  const pending = invites.data ?? [];
  const q = query.trim().toLowerCase();

  const visibleMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          (shopFilter === ALL || m.shopId === shopFilter) &&
          (!q ||
            m.displayName.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)),
      ),
    [members, shopFilter, q],
  );
  const visibleInvites = useMemo(
    () =>
      pending.filter(
        (i) =>
          (shopFilter === ALL || i.shopId === shopFilter) &&
          (!q || i.email.toLowerCase().includes(q)),
      ),
    [pending, shopFilter, q],
  );

  // Owner and managers are business-wide; staff are grouped by shop.
  const leaders = visibleMembers.filter((m) => m.role !== 'STAFF');
  const staff = visibleMembers.filter((m) => m.role === 'STAFF');

  const openInvite = () => router.push('/invite-member');

  const memberSubtitle = (m: TeamMember) => {
    if (m.role !== 'STAFF') {
      return m.role === 'OWNER'
        ? 'Owner · all shops'
        : `Manager · all ${shops.length} shops`;
    }
    return `Staff · ${shopName(m.shopId) ?? 'No shop'}`;
  };

  const memberRow = (m: TeamMember) => (
    <ListItem
      key={m.id}
      leading={<Avatar name={m.displayName} />}
      title={m.id === user?.id ? `${m.displayName} (you)` : m.displayName}
      subtitle={memberSubtitle(m)}
      value={
        m.lastLoginAt ? formatRelativeTime(m.lastLoginAt) : 'Never signed in'
      }>
      {m.isSupervisor ? (
        <View style={styles.chips}>
          <Badge label='Supervisor' tone='info' icon='Star' />
        </View>
      ) : null}
    </ListItem>
  );

  const doResend = () => {
    if (!selected) return;
    const email = selected.email;
    actions.current?.close();
    resend.mutate(selected.id, {
      onSuccess: () =>
        toast.success(`New link sent to ${email}`, 'Invitation resent'),
    });
  };

  const doRevoke = () => {
    if (!selected) return;
    const inv = selected;
    actions.current?.close();
    confirm.current?.ask({
      title: 'Revoke invitation?',
      message: `The link sent to ${inv.email} will stop working.`,
      confirmLabel: 'Revoke',
      icon: 'MailX',
      onConfirm: () =>
        revoke
          .mutateAsync(inv.id)
          .then(() => toast.success('Invitation revoked')),
    });
  };

  const refreshing =
    segment === 'members' ? team.isRefetching : invites.isRefetching;

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <ScrollView
        contentContainerStyle={[styles.pad, { paddingBottom: bottom }]}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='on-drag'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              segment === 'members' ? team.refetch() : invites.refetch()
            }
            tintColor={colors.text.primary}
          />
        }>
        <ScreenHeader
          title='Team'
          subtitle={
            user?.role === 'MANAGER'
              ? 'You can invite staff to any shop'
              : 'Invite managers and staff'
          }
          actionIcon='UserPlus'
          actionLabel='Invite someone'
          onAction={openInvite}
        />

        <SegmentedControl<Segment>
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'members', label: 'Members', count: members.length },
            { value: 'pending', label: 'Pending', count: pending.length },
          ]}
        />

        {shops.length > 1 ? (
          <FilterChips
            value={shopFilter}
            onChange={setShopFilter}
            options={[
              { value: ALL, label: 'All shops' },
              ...shops.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        ) : null}

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={
            segment === 'members'
              ? 'Search by name or email'
              : 'Search by email'
          }
        />

        {segment === 'members' ? (
          team.isLoading ? (
            <ListSection>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </ListSection>
          ) : team.isError ? (
            <EmptyState
              icon='CloudOff'
              title="Couldn't load the team"
              body='Pull down to try again.'
              actionLabel='Try again'
              onAction={() => team.refetch()}
            />
          ) : visibleMembers.length === 0 ? (
            members.length <= 1 ? (
              <EmptyState
                icon='UsersRound'
                title='Just you so far'
                body='Invite managers and staff. They appear here once they accept.'
                actionLabel='Invite someone'
                actionIcon='UserPlus'
                onAction={openInvite}
              />
            ) : (
              <EmptyState
                icon='SearchX'
                title='No matches'
                body='Try another name or shop.'
              />
            )
          ) : (
            <>
              {leaders.length > 0 ? (
                <ListSection title='Owner & managers'>
                  {leaders.map(memberRow)}
                </ListSection>
              ) : null}
              {staff.length > 0 ? (
                <ListSection title='Staff'>{staff.map(memberRow)}</ListSection>
              ) : null}
            </>
          )
        ) : invites.isLoading ? (
          <ListSection>
            <SkeletonRow />
            <SkeletonRow />
          </ListSection>
        ) : visibleInvites.length === 0 ? (
          <EmptyState
            icon='MailCheck'
            title={
              pending.length === 0 ? 'No pending invitations' : 'No matches'
            }
            body={
              pending.length === 0
                ? 'Everyone you invited has joined, or you have not invited anyone yet.'
                : undefined
            }
            actionLabel={pending.length === 0 ? 'Invite someone' : undefined}
            actionIcon='UserPlus'
            onAction={openInvite}
          />
        ) : (
          <ListSection>
            {visibleInvites.map((inv) => {
              const shop = shopName(inv.shopId);
              return (
                <ListItem
                  key={inv.id}
                  icon='Mail'
                  title={inv.email}
                  subtitle={[roleLabel(inv.role), shop]
                    .filter(Boolean)
                    .join(' · ')}
                  onPress={() => {
                    setSelected(inv);
                    actions.current?.open();
                  }}
                  trailing={
                    <AppText variant='caption' color='link' weight='semibold'>
                      Manage
                    </AppText>
                  }
                  chevron={false}>
                  <View style={styles.chips}>
                    {inv.isSupervisor ? (
                      <Badge label='Supervisor' tone='info' icon='Star' />
                    ) : null}
                    <Badge
                      label={formatExpiry(inv.expiresAt)}
                      tone={
                        daysUntil(inv.expiresAt) <= 2 ? 'warning' : 'neutral'
                      }
                    />
                  </View>
                </ListItem>
              );
            })}
          </ListSection>
        )}
      </ScrollView>

      <AppBottomSheet
        ref={actions}
        title={selected?.email}
        subtitle={selected ? formatExpiry(selected.expiresAt) : undefined}>
        <View style={styles.sheetBody}>
          <ListSection>
            <ListItem
              icon='Send'
              iconTone='brand'
              title='Resend invitation'
              subtitle='Sends a fresh link and extends the expiry'
              onPress={doResend}
              disabled={resend.isPending}
            />
            <ListItem
              icon='MailX'
              title='Revoke invitation'
              subtitle='The current link stops working'
              destructive
              onPress={doRevoke}
            />
          </ListSection>
        </View>
      </AppBottomSheet>
      <ConfirmSheet ref={confirm} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: spacing[5], gap: spacing[4] },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: 4,
  },
  sheetBody: { paddingHorizontal: spacing[4] },
});
