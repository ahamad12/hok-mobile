import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { ListItem, ListSection } from '@/components/ListItem';
import { OptionSheet, OptionSheetRef } from '@/components/OptionSheet';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import {
  useAssignTask,
  useTransitionTask,
  useVoidTask,
} from '@/features/work/api/work.mutations';
import { useTask } from '@/features/work/api/work.queries';
import { TaskStatus } from '@/features/work/api/work.types';
import { usePeople } from '@/features/work/hooks/usePeople';
import { priorityLabel } from '@/features/work/schemas/work.schemas';
import {
  isTaskOverdue,
  nextTaskStates,
  TASK_STATUS,
} from '@/features/work/utils/workUtils';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { formatBusinessDay, isoToBusinessDate } from '@/utils/businessDate';
import { formatRelativeTime } from '@/utils/time';

const UNASSIGNED = 'none';

export default function TaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const shopId = useShopId();
  const { manages, user } = useShopRole();
  const toast = useToast();
  const assignSheet = useRef<OptionSheetRef>(null);
  const reason = useRef<ReasonSheetRef>(null);

  const task = useTask(taskId);
  const transition = useTransitionTask(shopId, taskId);
  const assign = useAssignTask(shopId, taskId);
  const voidTask = useVoidTask(shopId, taskId);
  const { people, nameOf } = usePeople(shopId);

  const t = task.data;
  if (!t) {
    return (
      <FormScreen title='Task'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  const status = TASK_STATUS[t.status];
  const next = t.voidedAt ? [] : nextTaskStates(t.status);
  // The main move forward gets the primary button.
  const primary: TaskStatus | undefined = next.includes('DONE')
    ? 'DONE'
    : next.includes('IN_PROGRESS')
      ? 'IN_PROGRESS'
      : next[0];
  const others = next.filter((s) => s !== primary);

  const move = (to: TaskStatus) =>
    transition.mutate(to, {
      onSuccess: () =>
        toast.success(`Marked ${TASK_STATUS[to].label.toLowerCase()}`),
    });

  return (
    <FormScreen
      title='Task'
      footer={
        primary ? (
          <AppButton
            onPress={() => move(primary)}
            loading={transition.isPending}
            iconLeft={TASK_STATUS[primary].icon}
            fullWidth>
            {TASK_STATUS[primary].action}
          </AppButton>
        ) : undefined
      }>
      <View style={styles.head}>
        <View style={styles.chips}>
          <Badge
            label={t.voidedAt ? 'Voided' : status.label}
            tone={t.voidedAt ? 'error' : status.tone}
          />
          {isTaskOverdue(t) ? <Badge label='Overdue' tone='error' /> : null}
          {t.priority >= 5 ? (
            <Badge label={priorityLabel(t.priority)} tone='warning' />
          ) : null}
          {t.isRecurring ? <Badge label='Repeats' icon='Repeat' /> : null}
        </View>
        <AppText variant='h3'>{t.title}</AppText>
        {t.description ? (
          <AppText variant='body' color='secondary'>
            {t.description}
          </AppText>
        ) : null}
      </View>

      <ListSection>
        <ListItem
          icon='CalendarDays'
          title='Due'
          value={
            t.dueDate
              ? formatBusinessDay(isoToBusinessDate(t.dueDate))
              : 'No due date'
          }
        />
        <ListItem
          icon='UserRound'
          title='Assigned to'
          value={nameOf(t.assigneeId) ?? 'Unassigned'}
          onPress={
            t.voidedAt || t.status === 'DONE'
              ? undefined
              : () => assignSheet.current?.open()
          }
        />
        <ListItem
          icon='Clock'
          title='Created'
          value={formatRelativeTime(t.createdAt)}
        />
        {t.completedAt ? (
          <ListItem
            icon='CircleCheck'
            title='Completed'
            value={formatRelativeTime(t.completedAt)}
          />
        ) : null}
        {t.voidReason ? (
          <ListItem icon='Ban' title='Voided' subtitle={t.voidReason} />
        ) : null}
      </ListSection>

      {others.length > 0 || (manages && !t.voidedAt) ? (
        <ListSection title='More actions'>
          {others.map((s) => (
            <ListItem
              key={s}
              icon={TASK_STATUS[s].icon}
              title={TASK_STATUS[s].action}
              onPress={() => move(s)}
              disabled={transition.isPending}
            />
          ))}
          {t.assigneeId !== user?.id && !t.voidedAt && t.status !== 'DONE' ? (
            <ListItem
              icon='Hand'
              title='Assign to me'
              onPress={() =>
                user &&
                assign.mutate(user.id, {
                  onSuccess: () => toast.success('Assigned to you'),
                })
              }
            />
          ) : null}
          {manages && !t.voidedAt ? (
            <ListItem
              icon='Ban'
              title='Void task'
              subtitle='Keeps it on record as cancelled'
              destructive
              chevron={false}
              onPress={() =>
                reason.current?.ask({
                  title: 'Void this task?',
                  message:
                    'It is cancelled and kept on record with your reason.',
                  confirmLabel: 'Void task',
                  onConfirm: (r) =>
                    voidTask.mutateAsync(r).then(() => {
                      toast.success('Task voided');
                      router.back();
                    }),
                })
              }
            />
          ) : null}
        </ListSection>
      ) : null}

      <OptionSheet
        ref={assignSheet}
        title='Assign to'
        options={[
          { value: UNASSIGNED, label: 'Unassigned' },
          ...people.map((p) => ({
            value: p.id,
            label: p.name,
            description: p.hint,
          })),
        ]}
        value={t.assigneeId ?? UNASSIGNED}
        onSelect={(v) =>
          assign.mutate(v === UNASSIGNED ? null : v, {
            onSuccess: () =>
              toast.success(v === UNASSIGNED ? 'Unassigned' : 'Assigned'),
          })
        }
      />
      <ReasonSheet ref={reason} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing[3] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] },
});
