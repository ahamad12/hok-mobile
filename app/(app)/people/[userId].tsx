import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { useMyShops } from '@/features/shops/api/shops.queries';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useCapabilities } from '@/features/shops/hooks/useShopContext';
import { useTeamMembers } from '@/features/team/api/team.queries';
import { useTasks, useTickets } from '@/features/work/api/work.queries';
import { spacing } from '@/theme/Common';
import { formatRelativeTime } from '@/utils/time';

const ROLE = { OWNER: 'Owner', MANAGER: 'Manager', STAFF: 'Staff' } as const;

/**
 * A person: who they are, where they work, and the tasks and tickets
 * assigned to them. Scans, till entries and deliveries have no per-person
 * filter on the server, so they are not shown here. There is no messaging.
 */
export default function PersonScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const caps = useCapabilities();
  const team = useTeamMembers();
  const shops = useMyShops();

  const m = team.data?.find((p) => p.id === userId);
  // Tasks and tickets are per shop; only staff belong to one.
  const shopId = m?.role === 'STAFF' ? (m.shopId ?? '') : '';
  const tasks = useTasks(shopId, { assigneeId: userId });
  const tickets = useTickets(shopId, { assigneeId: userId });

  if (team.isLoading) {
    return (
      <FormScreen title='Person'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }
  if (!m) {
    return (
      <FormScreen title='Person'>
        <EmptyState
          icon='UserX'
          title='Not on the team'
          body='This person may have been removed or deactivated.'
        />
      </FormScreen>
    );
  }

  const shopName = shops.data?.find((s) => s.id === m.shopId)?.name;
  const openTasks = (tasks.data?.tasks ?? []).filter(
    (t) => t.status !== 'DONE',
  );
  const openTickets = (tickets.data?.tickets ?? []).filter(
    (t) => t.status !== 'CLOSED',
  );
  // Server rule: tasks and tickets can only be assigned to staff of a shop.
  const canAssign = caps.canAssignAnyTask && m.role === 'STAFF' && !!m.shopId;
  const goShop = (path: string, params: Record<string, string>) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...params },
    });

  return (
    <FormScreen
      title={m.displayName}
      footer={
        canAssign ? (
          <AppButton
            variant='brand'
            size='lg'
            iconLeft='ListPlus'
            fullWidth
            onPress={() => goShop('tasks/new', { assigneeId: m.id })}>
            Assign a task
          </AppButton>
        ) : undefined
      }>
      <View style={styles.who}>
        <Avatar name={m.displayName} size='lg' />
        <View style={styles.flex}>
          <AppText variant='body' color='secondary'>
            {m.email}
          </AppText>
          <View style={styles.chips}>
            <Badge label={ROLE[m.role]} />
            {m.isSupervisor ? (
              <Badge label='Supervisor' tone='info' icon='Star' />
            ) : null}
          </View>
        </View>
      </View>

      <ListSection>
        <ListItem
          icon='Store'
          title={
            m.role === 'STAFF'
              ? (shopName ?? 'No shop')
              : 'All hoks in the business'
          }
          subtitle='Works at'
          chevron={false}
        />
        <ListItem
          icon='Clock'
          title={
            m.lastLoginAt
              ? formatRelativeTime(m.lastLoginAt)
              : 'Never signed in'
          }
          subtitle='Last signed in'
          chevron={false}
        />
      </ListSection>

      {shopId ? (
        <>
          <ListSection title='Open tasks'>
            {openTasks.length === 0 ? (
              <ListItem icon='Check' title='No open tasks' chevron={false} />
            ) : (
              openTasks.map((t) => (
                <ListItem
                  key={t.id}
                  icon='ListTodo'
                  title={t.title}
                  onPress={() => goShop('tasks/[taskId]', { taskId: t.id })}
                />
              ))
            )}
          </ListSection>
          <ListSection title='Open tickets'>
            {openTickets.length === 0 ? (
              <ListItem icon='Check' title='No open tickets' chevron={false} />
            ) : (
              openTickets.map((t) => (
                <ListItem
                  key={t.id}
                  icon='MessageSquare'
                  title={t.subject}
                  onPress={() =>
                    goShop('tickets/[ticketId]', { ticketId: t.id })
                  }
                />
              ))
            )}
          </ListSection>
        </>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  who: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  chips: { flexDirection: 'row', gap: spacing[1], marginTop: spacing[2] },
});
