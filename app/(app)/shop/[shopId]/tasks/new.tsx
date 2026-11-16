import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AppButton } from '@/components/AppButton';
import { FormSelect } from '@/components/FormSelect';
import { SegmentedControl } from '@/components/SegmentedControl';
import { FormField, useServerErrors } from '@/features/auth/components';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { useCreateTask } from '@/features/work/api/work.mutations';
import { RecurringConfig } from '@/features/work/api/work.types';
import { usePeople } from '@/features/work/hooks/usePeople';
import {
  PRIORITY_OPTIONS,
  TaskFormValues,
  taskSchema,
} from '@/features/work/schemas/work.schemas';
import { useToast } from '@/hooks/useToast';
import { parseBusinessDate, today } from '@/utils/businessDate';
import { blankToUndefined } from '@/utils/formSchemas';

const UNASSIGNED = 'none';

function recurringFor(
  repeat: TaskFormValues['repeat'],
  due: string,
): RecurringConfig | undefined {
  const anchor = due ? parseBusinessDate(due) : parseBusinessDate(today());
  switch (repeat) {
    case 'daily':
      return { interval: 'daily' };
    case 'weekly':
      return { interval: 'weekly', dayOfWeek: anchor.getDay() };
    case 'monthly':
      return { interval: 'monthly', dayOfMonth: anchor.getDate() };
    default:
      return undefined;
  }
}

export default function NewTaskScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const toast = useToast();
  const create = useCreateTask(shopId);
  // Opened from a person page: start with that person assigned.
  const { assigneeId: preset } = useLocalSearchParams<{
    assigneeId?: string;
  }>();
  const { people } = usePeople(shopId);

  const { control, handleSubmit, setError } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: today(),
      priority: '0',
      assigneeId: preset ?? UNASSIGNED,
      repeat: 'none',
    },
    mode: 'onTouched',
  });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'title',
    'description',
    'dueDate',
    'assigneeId',
  ]);

  const submit = handleSubmit((v) => {
    setFormError(null);
    const recurringConfig = recurringFor(v.repeat, v.dueDate);
    create.mutate(
      {
        title: v.title.trim(),
        description: blankToUndefined(v.description),
        dueDate: blankToUndefined(v.dueDate),
        priority: Number(v.priority),
        assigneeId: v.assigneeId === UNASSIGNED ? undefined : v.assigneeId,
        ...(recurringConfig ? { isRecurring: true, recurringConfig } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Task added');
          router.back();
        },
        onError,
      },
    );
  });

  return (
    <FormScreen
      title='New task'
      dismiss='close'
      error={formError}
      footer={
        <AppButton onPress={submit} loading={create.isPending} fullWidth>
          Add task
        </AppButton>
      }>
      <FormField
        control={control}
        name='title'
        label='What needs doing?'
        placeholder='e.g. Restock the fridge'
      />
      <FormField
        control={control}
        name='description'
        label='Details (optional)'
        multiline
        placeholder='Anything the person doing it should know'
      />
      <FormField
        control={control}
        name='dueDate'
        label='Due date'
        placeholder='YYYY-MM-DD'
        helperText='Leave blank for no due date'
        keyboardType='numbers-and-punctuation'
      />
      <FormSelect
        control={control}
        name='assigneeId'
        label='Assign to'
        options={[
          {
            value: UNASSIGNED,
            label: 'Unassigned',
            description: 'Anyone in the shop can pick it up',
          },
          ...people.map((p) => ({
            value: p.id,
            label: p.name,
            description: p.hint,
          })),
        ]}
      />
      <Controller
        control={control}
        name='priority'
        render={({ field }) => (
          <SegmentedControl
            value={field.value}
            onChange={field.onChange}
            options={PRIORITY_OPTIONS}
          />
        )}
      />
      <FormSelect
        control={control}
        name='repeat'
        label='Repeat'
        options={[
          { value: 'none', label: 'Does not repeat' },
          { value: 'daily', label: 'Every day' },
          {
            value: 'weekly',
            label: 'Every week',
            description: 'Same weekday as the due date',
          },
          {
            value: 'monthly',
            label: 'Every month',
            description: 'Same day of the month as the due date',
          },
        ]}
      />
    </FormScreen>
  );
}
