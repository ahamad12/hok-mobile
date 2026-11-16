import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import {
  useFinalizeDailySummary,
  useVoidDailySummary,
} from '@/features/money/api/money.mutations';
import {
  useDailySummaries,
  useDailySummary,
} from '@/features/money/api/money.queries';
import { DayBreakdown } from '@/features/money/components/DayBreakdown';
import {
  addedSince,
  useDaySources,
} from '@/features/money/hooks/useDaySources';
import { usePersonName } from '@/features/money/hooks/usePersonName';
import {
  DayAggregates,
  expectedClosing,
} from '@/features/money/utils/reconcile';
import { FormScreen } from '@/features/shops/components/FormScreen';
import {
  useCapabilities,
  useShopId,
} from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { formatBusinessDay, isoToBusinessDate } from '@/utils/businessDate';
import { formatSignedMoney } from '@/utils/money';

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

/**
 * One day's close, reconciled from its stored figures (read mode). Owners
 * and managers finalize a draft or void any live summary; supervisors read
 * their draft while it awaits a manager. Plain staff never see money here.
 */
export default function DayReviewScreen() {
  const { summaryId } = useLocalSearchParams<{ summaryId: string }>();
  const router = useRouter();
  const shopId = useShopId();
  const caps = useCapabilities();
  const toast = useToast();
  const confirm = useRef<ConfirmSheetRef>(null);
  const reason = useRef<ReasonSheetRef>(null);

  const summary = useDailySummary(summaryId);
  const s = summary.data;
  const day = s ? isoToBusinessDate(s.date) : '';
  const sources = useDaySources(s ? shopId : '', day);
  const later = useDailySummaries(shopId);
  const nameOf = usePersonName(shopId);
  const finalize = useFinalizeDailySummary(shopId);
  const voidSummary = useVoidDailySummary(shopId);

  if (!caps.canDraftDay) {
    return (
      <FormScreen title='Day close'>
        <EmptyState
          icon='Lock'
          title='Not available'
          body='Day closes are for owners, managers and supervisors.'
        />
      </FormScreen>
    );
  }
  if (!s) {
    return (
      <FormScreen title='Day close'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  const voided = !!s.voidedAt;
  const draft = s.status === 'DRAFT' && !voided;
  // Stored figures are the record; recompute only to prove they reconcile.
  const a: DayAggregates = {
    openingBalance: s.openingBalance,
    totalCashIn: s.totalCashIn,
    totalCashOut: s.totalCashOut,
    scratchRevenue: s.scratchRevenue,
    deliveryExpense: s.deliveryExpense,
    otherIncome: s.otherIncome,
    otherExpense: s.otherExpense,
  };
  const drift = s.closingBalance - expectedClosing(a) !== s.variance;

  const stale = draft ? addedSince(sources, s.createdAt) : 0;
  const laterDays = (later.data?.summaries ?? []).some(
    (o) => o.id !== s.id && o.date > s.date,
  );

  const byLine = voided
    ? 'Voided'
    : s.status === 'FINALIZED'
      ? `Closed by ${nameOf(s.finalizedById)}${s.finalizedAt ? ` · ${timeOf(s.finalizedAt)}` : ''}`
      : `Draft by ${nameOf(s.createdById)} · ${timeOf(s.createdAt)}`;

  const checks: { ok: boolean; text: string }[] = [
    sources.morningScans > 0 && sources.eveningScans > 0
      ? { ok: true, text: 'Both scratch scans done' }
      : {
          ok: false,
          text: `${sources.morningScans ? 'Evening' : 'Morning'} scratch scan missing`,
        },
  ];
  if (sources.reversals) {
    checks.push({
      ok: false,
      text: `${sources.reversals} till ${sources.reversals === 1 ? 'reversal' : 'reversals'} recorded`,
    });
  }
  if (sources.shortDeliveries) {
    checks.push({
      ok: false,
      text: `${sources.shortDeliveries} ${sources.shortDeliveries === 1 ? 'delivery' : 'deliveries'} short (${sources.shortItems} items)`,
    });
  }
  if (s.variance !== 0) {
    checks.push({
      ok: false,
      text: `Variance recorded (${formatSignedMoney(s.variance)}) · no shop threshold set yet`,
    });
  }
  if (stale) {
    checks.push({
      ok: false,
      text: `${stale} ${stale === 1 ? 'entry' : 'entries'} added after this draft · void and resubmit to include them`,
    });
  }
  if (drift) {
    checks.push({
      ok: false,
      text: 'Stored variance does not reconcile · report this',
    });
  }

  const open = (path: string) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId },
    });

  return (
    <FormScreen
      title={`Day close · ${formatBusinessDay(day)}`}
      subtitle={byLine}
      footer={
        caps.canFinalizeDay && draft ? (
          <AppButton
            variant='brand'
            size='lg'
            fullWidth
            iconLeft='Lock'
            onPress={() =>
              confirm.current?.ask({
                title: 'Finalize this day?',
                message: 'Finalizes the day. Corrections require voiding it.',
                confirmLabel: 'Finalize day',
                destructive: false,
                icon: 'Lock',
                onConfirm: () =>
                  finalize
                    .mutateAsync(s.id)
                    .then(() => toast.success('Day finalized')),
              })
            }>
            Finalize day
          </AppButton>
        ) : undefined
      }>
      {draft && !caps.canFinalizeDay ? (
        <AppText variant='body' color='secondary'>
          Submitted. Waiting for an owner or manager to finalize.
        </AppText>
      ) : null}

      <DayBreakdown
        a={a}
        byCategory={s.breakdown.tillByCategory}
        openingLabel='Opening balance'
        morningScratch={sources.morningScratch}
        eveningScratch={sources.eveningScratch}
        deliveryCount={sources.deliveries.length}
        shortItems={sources.shortItems}
        expenseCount={sources.expenses.length}
        actual={s.closingBalance}
        onOpen={open}
      />

      {!voided ? (
        <ListSection title='Checks'>
          {checks.map((c) => (
            <ListItem
              key={c.text}
              icon={c.ok ? 'CircleCheck' : 'Flag'}
              iconTone={c.ok ? 'success' : 'warning'}
              title={c.text}
              titleLines={3}
              chevron={false}
            />
          ))}
        </ListSection>
      ) : null}

      {s.notes || s.voidReason ? (
        <ListSection title='Notes'>
          {s.notes ? (
            <ListItem
              icon='StickyNote'
              title={s.notes}
              titleLines={6}
              chevron={false}
            />
          ) : null}
          {s.voidReason ? (
            <ListItem
              icon='Ban'
              title='Voided'
              subtitle={s.voidReason}
              chevron={false}
            />
          ) : null}
        </ListSection>
      ) : null}

      {caps.canFinalizeDay && !voided ? (
        <ListSection>
          <ListItem
            icon='Ban'
            title='Void day'
            subtitle='Kept on record; the day can then be closed again'
            destructive
            chevron={false}
            onPress={() =>
              reason.current?.ask({
                title: 'Void this day close?',
                message: laterDays
                  ? 'It stays on record as voided. Later days were already closed: their opening balances will not change.'
                  : 'It stays on record as voided, and the day can be closed again.',
                confirmLabel: 'Void day',
                minLength: 3,
                onConfirm: (r) =>
                  voidSummary.mutateAsync({ id: s.id, reason: r }).then(() => {
                    toast.success('Day voided');
                    router.back();
                  }),
              })
            }
          />
        </ListSection>
      ) : null}
      <ConfirmSheet ref={confirm} />
      <ReasonSheet ref={reason} />
    </FormScreen>
  );
}
