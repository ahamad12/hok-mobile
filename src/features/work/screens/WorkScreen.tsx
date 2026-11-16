import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { ListItem, ListSection } from '@/components/ListItem';
import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SkeletonRow } from '@/components/Skeleton';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useTasks, useTickets } from '@/features/work/api/work.queries';
import { TaskFilters, TicketFilters } from '@/features/work/api/work.types';
import { priorityLabel } from '@/features/work/schemas/work.schemas';
import {
  isTaskOverdue,
  sortTasks,
  sortTickets,
  TASK_STATUS,
  TICKET_PRIORITY,
  TICKET_STATUS,
  TICKET_TYPE,
} from '@/features/work/utils/workUtils';
import { spacing } from '@/theme/Common';
import { formatBusinessDay, isoToBusinessDate } from '@/utils/businessDate';
import { formatRelativeTime } from '@/utils/time';

type Segment = 'tasks' | 'tickets';
type TaskTab = 'open' | 'mine' | 'overdue' | 'done';
type TicketTab = 'active' | 'ack' | 'mine' | 'closed';

export default function WorkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: Segment; filter?: TaskTab }>();
  const shopId = useShopId();
  const { user } = useShopRole();

  const [segment, setSegment] = useState<Segment>(params.view ?? 'tasks');
  const [taskTab, setTaskTab] = useState<TaskTab>(params.filter ?? 'open');
  const [ticketTab, setTicketTab] = useState<TicketTab>('active');
  const [search, setSearch] = useState('');

  // Deep links from Home ("2 tasks overdue", "open tickets").
  useEffect(() => {
    if (params.view) setSegment(params.view);
    if (params.filter) setTaskTab(params.filter);
  }, [params.view, params.filter]);

  const q = search.trim() || undefined;
  const taskFilters: TaskFilters = {
    search: q,
    ...(taskTab === 'mine' && user ? { assigneeId: user.id } : {}),
    ...(taskTab === 'overdue' ? { isOverdue: true } : {}),
    ...(taskTab === 'done' ? { status: 'DONE' as const } : {}),
  };
  const ticketFilters: TicketFilters = {
    search: q,
    ...(ticketTab === 'mine' && user ? { assigneeId: user.id } : {}),
    ...(ticketTab === 'closed' ? { status: 'CLOSED' as const } : {}),
  };

  const tasks = useTasks(shopId, taskFilters);
  const tickets = useTickets(shopId, ticketFilters);

  const taskRows = useMemo(() => {
    const list = (tasks.data?.tasks ?? []).filter((t) => !t.voidedAt);
    return sortTasks(
      taskTab === 'open' || taskTab === 'mine'
        ? list.filter((t) => t.status !== 'DONE')
        : list,
    );
  }, [tasks.data, taskTab]);

  const ticketRows = useMemo(() => {
    const list = tickets.data?.tickets ?? [];
    const active = (s: string) => s !== 'RESOLVED' && s !== 'CLOSED';
    const filtered =
      ticketTab === 'active' || ticketTab === 'mine'
        ? list.filter((t) => active(t.status))
        : ticketTab === 'ack'
          ? // No server filter for requiresAck; whether *you* acked needs
            // one call per ticket, so this lists all that ask for one.
            list.filter((t) => t.requiresAck && active(t.status))
          : list;
    return sortTickets(filtered);
  }, [tickets.data, ticketTab]);

  const go = (path: string, extra: Record<string, string> = {}) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...extra },
    });

  const loading = segment === 'tasks' ? tasks.isLoading : tickets.isLoading;

  return (
    <ShopTabScreen
      title='Work'
      actions={[
        segment === 'tasks'
          ? {
              icon: 'ListPlus',
              label: 'New task',
              onPress: () => go('tasks/new'),
            }
          : {
              icon: 'MessageSquarePlus',
              label: 'New ticket',
              onPress: () => go('tickets/new'),
            },
      ]}
      onRefresh={() =>
        segment === 'tasks' ? tasks.refetch() : tickets.refetch()
      }>
      <SegmentedControl<Segment>
        value={segment}
        onChange={setSegment}
        options={[
          { value: 'tasks', label: 'Tasks' },
          { value: 'tickets', label: 'Tickets' },
        ]}
      />
      <View style={styles.filters}>
        {segment === 'tasks' ? (
          <FilterChips<TaskTab>
            value={taskTab}
            onChange={setTaskTab}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'mine', label: 'Mine' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'done', label: 'Done' },
            ]}
          />
        ) : (
          <FilterChips<TicketTab>
            value={ticketTab}
            onChange={setTicketTab}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'ack', label: 'Needs acknowledgement' },
              { value: 'mine', label: 'Assigned to me' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        )}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder={segment === 'tasks' ? 'Search tasks' : 'Search tickets'}
        />
      </View>

      {loading ? (
        <ListSection>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </ListSection>
      ) : segment === 'tasks' ? (
        taskRows.length === 0 ? (
          <EmptyState
            icon='ListChecks'
            title={
              taskTab === 'overdue'
                ? 'Nothing overdue'
                : taskTab === 'done'
                  ? 'Nothing done yet'
                  : 'No open tasks'
            }
            body={
              taskTab === 'open'
                ? 'Add a task for yourself or the team.'
                : undefined
            }
            actionLabel={taskTab === 'open' ? 'New task' : undefined}
            actionIcon='ListPlus'
            onAction={() => go('tasks/new')}
          />
        ) : (
          <ListSection>
            {taskRows.map((t) => {
              const s = TASK_STATUS[t.status];
              const overdue = isTaskOverdue(t);
              const due = t.dueDate
                ? `Due ${formatBusinessDay(isoToBusinessDate(t.dueDate))}`
                : null;
              return (
                <ListItem
                  key={t.id}
                  icon={s.icon}
                  iconTone={
                    t.status === 'DONE'
                      ? 'success'
                      : overdue
                        ? 'error'
                        : 'neutral'
                  }
                  title={t.title}
                  subtitle={
                    [due, t.isRecurring ? 'Repeats' : null]
                      .filter(Boolean)
                      .join(' · ') || undefined
                  }
                  onPress={() => go('tasks/[taskId]', { taskId: t.id })}>
                  <View style={styles.chips}>
                    <Badge label={s.label} tone={s.tone} />
                    {overdue ? <Badge label='Overdue' tone='error' /> : null}
                    {t.priority >= 5 ? (
                      <Badge label={priorityLabel(t.priority)} tone='warning' />
                    ) : null}
                    {t.assigneeId === user?.id ? (
                      <Badge label='You' tone='inverse' />
                    ) : null}
                  </View>
                </ListItem>
              );
            })}
          </ListSection>
        )
      ) : ticketRows.length === 0 ? (
        <EmptyState
          icon='MessagesSquare'
          title={ticketTab === 'ack' ? 'Nothing to acknowledge' : 'No tickets'}
          body={
            ticketTab === 'active'
              ? 'Report an issue, or send the team an instruction.'
              : undefined
          }
          actionLabel={ticketTab === 'active' ? 'New ticket' : undefined}
          actionIcon='MessageSquarePlus'
          onAction={() => go('tickets/new')}
        />
      ) : (
        <ListSection>
          {ticketRows.map((t) => {
            const type = TICKET_TYPE[t.type];
            const pr = TICKET_PRIORITY[t.priority];
            return (
              <ListItem
                key={t.id}
                icon={type.icon}
                iconTone={
                  pr.rank <= 1 && t.status !== 'CLOSED' ? 'error' : 'neutral'
                }
                title={t.subject}
                subtitle={`${type.label} · ${formatRelativeTime(t.createdAt)}`}
                onPress={() => go('tickets/[ticketId]', { ticketId: t.id })}>
                <View style={styles.chips}>
                  <Badge
                    label={TICKET_STATUS[t.status].label}
                    tone={TICKET_STATUS[t.status].tone}
                  />
                  {pr.rank <= 1 ? (
                    <Badge label={pr.label} tone={pr.tone} />
                  ) : null}
                  {t.requiresAck ? (
                    <Badge label='Ack required' tone='info' />
                  ) : null}
                </View>
              </ListItem>
            );
          })}
        </ListSection>
      )}
    </ShopTabScreen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: spacing[3] },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: 4,
  },
});
