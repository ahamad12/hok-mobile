import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { IconButton } from '@/components/IconButton';
import { ListItem, ListSection } from '@/components/ListItem';
import { OptionSheet, OptionSheetRef } from '@/components/OptionSheet';
import { useColors } from '@/contexts/ColorContext';
import { useShopStaff } from '@/features/shops/api/shops.queries';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import {
  useAcknowledgeTicket,
  useAssignTicket,
  useSendTicketMessage,
  useTransitionTicket,
} from '@/features/work/api/work.mutations';
import {
  useAcknowledgements,
  useTicket,
} from '@/features/work/api/work.queries';
import { usePeople } from '@/features/work/hooks/usePeople';
import {
  nextTicketStates,
  TICKET_PRIORITY,
  TICKET_STATUS,
  TICKET_TYPE,
} from '@/features/work/utils/workUtils';
import { useToast } from '@/hooks/useToast';
import { borderRadius, spacing } from '@/theme/Common';
import { formatRelativeTime } from '@/utils/time';

const UNASSIGNED = 'none';

export default function TicketScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();
  const shopId = useShopId();
  const { manages, user } = useShopRole();
  const { colors } = useColors();
  const toast = useToast();
  const assignSheet = useRef<OptionSheetRef>(null);
  const [draft, setDraft] = useState('');
  const [acked, setAcked] = useState(false);

  const detail = useTicket(ticketId);
  const t = detail.data?.ticket;
  const broadcast = !!t && t.type !== 'ISSUE';
  // Roster is OWNER/MANAGER only, and only for broadcasts.
  const acks = useAcknowledgements(ticketId, manages && broadcast);
  const send = useSendTicketMessage(ticketId);
  const transition = useTransitionTicket(shopId, ticketId);
  const assign = useAssignTicket(shopId, ticketId);
  const ack = useAcknowledgeTicket(ticketId);
  const staff = useShopStaff(shopId);
  const { nameOf } = usePeople(shopId);

  if (!t) {
    return (
      <SafeAreaView
        style={[styles.flex, { backgroundColor: colors.background.default }]}>
        <AppActivityIndicator />
      </SafeAreaView>
    );
  }

  const type = TICKET_TYPE[t.type];
  const status = TICKET_STATUS[t.status];
  const priority = TICKET_PRIORITY[t.priority];
  const next = nextTicketStates(t.type, t.status);
  const messages = detail.data?.messages ?? [];
  const myAck = acks.data?.audience.find((a) => a.userId === user?.id);
  const alreadyAcked = acked || !!myAck?.acknowledgedAt;

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    send.mutate(text, { onSuccess: () => setDraft('') });
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.flex, { backgroundColor: colors.background.default }]}>
      <View style={styles.topBar}>
        <IconButton
          icon='ChevronLeft'
          label='Back'
          onPress={() => router.back()}
          size={40}
        />
        <AppText variant='h6' numberOfLines={1} style={styles.flex}>
          {type.label}
        </AppText>
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps='handled'>
          <View style={styles.head}>
            <View style={styles.chips}>
              <Badge label={status.label} tone={status.tone} />
              {priority.rank <= 1 ? (
                <Badge label={priority.label} tone={priority.tone} />
              ) : null}
              {t.requiresAck ? (
                <Badge label='Ack required' tone='info' />
              ) : null}
            </View>
            <AppText variant='h3'>{t.subject}</AppText>
            <AppText variant='caption' color='tertiary'>
              {`Opened ${formatRelativeTime(t.createdAt)} by ${nameOf(t.createdById) ?? 'a teammate'}`}
            </AppText>
          </View>

          {broadcast && t.requiresAck && !manages ? (
            <View
              style={[
                styles.ackCard,
                { backgroundColor: colors.background.infoSubtle },
              ]}>
              <AppText variant='bodySmall' style={styles.flex}>
                {alreadyAcked
                  ? 'You acknowledged this.'
                  : 'Please confirm you have read this.'}
              </AppText>
              {!alreadyAcked ? (
                <AppButton
                  size='sm'
                  onPress={() =>
                    ack.mutate(undefined, {
                      onSuccess: () => {
                        setAcked(true);
                        toast.success('Acknowledged');
                      },
                    })
                  }
                  loading={ack.isPending}>
                  Acknowledge
                </AppButton>
              ) : null}
            </View>
          ) : null}

          {manages && broadcast && acks.data ? (
            <ListSection
              title={`Acknowledged ${acks.data.acknowledgedCount} of ${acks.data.totalAudience}`}>
              {acks.data.audience.map((a) => (
                <ListItem
                  key={a.userId}
                  icon={a.acknowledgedAt ? 'CircleCheck' : 'Circle'}
                  iconTone={a.acknowledgedAt ? 'success' : 'neutral'}
                  title={a.displayName}
                  value={
                    a.acknowledgedAt
                      ? formatRelativeTime(a.acknowledgedAt)
                      : 'Not yet'
                  }
                />
              ))}
            </ListSection>
          ) : null}

          <View style={styles.thread}>
            {messages.map((m) => {
              const mine = m.senderId === user?.id;
              return (
                <View
                  key={m.id}
                  style={[styles.msgWrap, mine && styles.mineWrap]}>
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: mine
                          ? colors.button.primary.default
                          : colors.background.surface,
                      },
                    ]}>
                    <AppText
                      variant='body'
                      customColor={
                        mine ? colors.text.inverse : colors.text.primary
                      }>
                      {m.message}
                    </AppText>
                  </View>
                  <AppText variant='caption' color='tertiary'>
                    {`${mine ? 'You' : (nameOf(m.senderId) ?? 'Teammate')} · ${formatRelativeTime(m.createdAt)}`}
                  </AppText>
                </View>
              );
            })}
          </View>

          {next.length > 0 || (manages && t.type === 'ISSUE') ? (
            <ListSection title='Actions'>
              {next.map((s) => (
                <ListItem
                  key={s}
                  icon={
                    s === 'CLOSED'
                      ? 'CircleX'
                      : s === 'RESOLVED'
                        ? 'CircleCheck'
                        : s === 'OPEN'
                          ? 'RotateCcw'
                          : 'CirclePlay'
                  }
                  title={TICKET_STATUS[s].action}
                  disabled={transition.isPending}
                  onPress={() =>
                    transition.mutate(s, {
                      onSuccess: () =>
                        toast.success(
                          `Ticket ${TICKET_STATUS[s].label.toLowerCase()}`,
                        ),
                    })
                  }
                />
              ))}
              {manages && t.type === 'ISSUE' ? (
                <ListItem
                  icon='UserRound'
                  title='Assigned to'
                  value={nameOf(t.assigneeId) ?? 'Nobody'}
                  onPress={() => assignSheet.current?.open()}
                />
              ) : null}
            </ListSection>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.composer,
            { backgroundColor: colors.background.default },
          ]}>
          <AppInput
            value={draft}
            onChangeText={setDraft}
            placeholder='Write a reply'
            multiline
            containerStyle={styles.flex}
            maxLength={5000}
          />
          <IconButton
            icon='SendHorizontal'
            label='Send reply'
            variant='solid'
            onPress={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>

      <OptionSheet
        ref={assignSheet}
        title='Assign to'
        subtitle='Issues go to staff of this shop'
        options={[
          { value: UNASSIGNED, label: 'Nobody' },
          ...(staff.data ?? [])
            .filter((s) => s.role === 'STAFF')
            .map((s) => ({ value: s.id, label: s.displayName })),
        ]}
        value={t.assigneeId ?? UNASSIGNED}
        onSelect={(v) =>
          assign.mutate(v === UNASSIGNED ? null : v, {
            onSuccess: () => toast.success('Assignment updated'),
          })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  body: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    gap: spacing[6],
  },
  head: { gap: spacing[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] },
  ackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.xl,
  },
  thread: { gap: spacing[4] },
  msgWrap: { alignItems: 'flex-start', gap: 4, maxWidth: '85%' },
  mineWrap: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
  },
});
