import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { AppToggle } from '@/components/AppToggle';
import { FormSelect } from '@/components/FormSelect';
import { ListItem, ListSection } from '@/components/ListItem';
import { FormField, useServerErrors } from '@/features/auth/components';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useCreateTicket } from '@/features/work/api/work.mutations';
import { TicketType } from '@/features/work/api/work.types';
import {
  TicketFormValues,
  ticketSchema,
} from '@/features/work/schemas/work.schemas';
import { TICKET_PRIORITY, TICKET_TYPE } from '@/features/work/utils/workUtils';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

export default function NewTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: TicketType }>();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const create = useCreateTicket(shopId);

  // Staff report issues; instructions and announcements come from managers.
  const types: TicketType[] = manages
    ? ['ISSUE', 'INSTRUCTION', 'ANNOUNCEMENT']
    : ['ISSUE'];

  const { control, handleSubmit, setError, setValue } =
    useForm<TicketFormValues>({
      resolver: zodResolver(ticketSchema),
      defaultValues: {
        type:
          params.type && types.includes(params.type) ? params.type : 'ISSUE',
        subject: '',
        body: '',
        priority: 'NORMAL',
        // Server default for instructions and announcements.
        requiresAck: true,
      },
      mode: 'onTouched',
    });
  const type = useWatch({ control, name: 'type' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'type',
    'subject',
    'body',
    'priority',
    'requiresAck',
  ]);

  const submit = handleSubmit((v) => {
    setFormError(null);
    create.mutate(
      {
        type: v.type,
        subject: v.subject.trim(),
        body: v.body.trim(),
        priority: v.priority,
        requiresAck: v.type === 'ISSUE' ? undefined : v.requiresAck,
      },
      {
        onSuccess: ({ ticket }) => {
          toast.success('Ticket created');
          router.replace({
            pathname: '/shop/[shopId]/tickets/[ticketId]',
            params: { shopId, ticketId: ticket.id },
          });
        },
        onError,
      },
    );
  });

  return (
    <FormScreen
      title='New ticket'
      dismiss='close'
      error={formError}
      footer={
        <AppButton onPress={submit} loading={create.isPending} fullWidth>
          {type === 'ISSUE' ? 'Report issue' : 'Send'}
        </AppButton>
      }>
      {types.length > 1 ? (
        <ListSection title='Type'>
          {types.map((t) => (
            <ListItem
              key={t}
              icon={TICKET_TYPE[t].icon}
              iconTone={type === t ? 'brand' : 'neutral'}
              title={TICKET_TYPE[t].label}
              subtitle={TICKET_TYPE[t].hint}
              trailing={
                type === t ? (
                  <AppText color='link' weight='semibold'>
                    Selected
                  </AppText>
                ) : undefined
              }
              chevron={false}
              onPress={() => setValue('type', t, { shouldDirty: true })}
            />
          ))}
        </ListSection>
      ) : null}

      <FormField
        control={control}
        name='subject'
        label='Subject'
        placeholder={
          type === 'ISSUE'
            ? 'e.g. Fridge not cooling'
            : 'e.g. New opening hours'
        }
      />
      <FormField
        control={control}
        name='body'
        label='Message'
        multiline
        placeholder='Describe it so the team can act on it'
      />
      <FormSelect
        control={control}
        name='priority'
        label='Priority'
        options={(['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const).map((p) => ({
          value: p,
          label: TICKET_PRIORITY[p].label,
        }))}
      />
      {type !== 'ISSUE' ? (
        <Controller
          control={control}
          name='requiresAck'
          render={({ field }) => (
            <View style={styles.toggleRow}>
              <View style={styles.flex}>
                <AppText weight='semibold'>Ask everyone to acknowledge</AppText>
                <AppText variant='caption' color='secondary'>
                  Track who has read it
                </AppText>
              </View>
              <AppToggle value={field.value} onValueChange={field.onChange} />
            </View>
          )}
        />
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  flex: { flex: 1 },
});
