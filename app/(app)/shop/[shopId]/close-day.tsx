import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { ListItem, ListSection } from '@/components/ListItem';
import { FormField, useServerErrors } from '@/features/auth/components';
import { useCreateDailySummary } from '@/features/money/api/money.mutations';
import { useDailySummaryByDate } from '@/features/money/api/money.queries';
import { DayBreakdown } from '@/features/money/components/DayBreakdown';
import { useDaySources } from '@/features/money/hooks/useDaySources';
import {
  CloseDayFormValues,
  closeDaySchema,
} from '@/features/money/schemas/money.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import {
  useCapabilities,
  useShopId,
} from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { formatBusinessDay, today } from '@/utils/businessDate';
import { parseMoneyToCents } from '@/utils/money';

/**
 * Compose mode of the day review: the same reconciled breakdown the server
 * will store, read-only, plus one input for the counted cash. The live
 * variance uses the server's formula and opening (the last close), so it
 * equals the stored variance after submit. A day with a summary already
 * opens that summary instead (drafts are create-only).
 */
export default function CloseDayScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const date = dateParam ?? today();
  const router = useRouter();
  const shopId = useShopId();
  const caps = useCapabilities();
  const toast = useToast();

  const existing = useDailySummaryByDate(shopId, date);
  const sources = useDaySources(shopId, date);
  const create = useCreateDailySummary(shopId);

  const { control, handleSubmit, setError } = useForm<CloseDayFormValues>({
    resolver: zodResolver(closeDaySchema),
    defaultValues: { closingBalance: '', openingBalance: '', notes: '' },
    mode: 'onTouched',
  });
  const counted = useWatch({ control, name: 'closingBalance' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'closingBalance',
    'notes',
  ]);

  useEffect(() => {
    if (existing.data) {
      router.replace({
        pathname: '/shop/[shopId]/day/[summaryId]',
        params: { shopId, summaryId: existing.data.id },
      });
    }
  }, [existing.data, router, shopId]);

  if (!caps.canDraftDay) {
    return (
      <FormScreen title='Close the day'>
        <EmptyState
          icon='Lock'
          title='Not available'
          body='An owner, manager or supervisor closes the day.'
        />
      </FormScreen>
    );
  }
  if (existing.isLoading || existing.data || sources.loading) {
    return (
      <FormScreen title='Close the day'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  // Supervisors close after both scans; managers can close regardless
  // (e.g. when no supervisor is on).
  const scansDone = sources.morningScans > 0 && sources.eveningScans > 0;
  const blocked = !caps.canFinalizeDay && !scansDone;

  const byCategory = sources.tillEntries.reduce<Record<string, number>>(
    (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }),
    {},
  );

  const submit = handleSubmit((v) => {
    setFormError(null);
    create.mutate(
      {
        date,
        closingBalance: parseMoneyToCents(v.closingBalance) ?? 0,
        notes: v.notes.trim() || undefined,
      },
      {
        onSuccess: (s) => {
          toast.success(
            caps.canFinalizeDay
              ? 'Review and finalize it'
              : 'Waiting for a manager to finalize',
            'Day submitted',
          );
          router.replace({
            pathname: '/shop/[shopId]/day/[summaryId]',
            params: { shopId, summaryId: s.id },
          });
        },
        onError,
      },
    );
  });

  return (
    <FormScreen
      title={`Close ${formatBusinessDay(date).toLowerCase()}`}
      subtitle='Count the till. Everything else is filled in for you.'
      error={formError}
      footer={
        <AppButton
          variant='brand'
          size='lg'
          onPress={submit}
          loading={create.isPending}
          disabled={blocked}
          fullWidth>
          Submit day close
        </AppButton>
      }>
      {blocked ? (
        <ListSection>
          <ListItem
            icon='Flag'
            iconTone='warning'
            title='Finish both scratch scans first'
            subtitle={`${sources.morningScans ? 'Evening' : 'Morning'} scan still to do`}
            onPress={() =>
              router.push({
                pathname: '/shop/[shopId]/scratch',
                params: {
                  shopId,
                  shift: sources.morningScans ? 'EVENING' : 'MORNING',
                },
              })
            }
          />
        </ListSection>
      ) : null}

      <FormField
        control={control}
        name='closingBalance'
        label='Counted cash in the till'
        placeholder='0.00'
        keyboardType='decimal-pad'
      />

      <DayBreakdown
        a={sources.aggregates}
        byCategory={byCategory}
        openingLabel={
          sources.hasPrevious
            ? 'Opening (last close)'
            : 'Opening (no earlier close)'
        }
        morningScratch={sources.morningScratch}
        eveningScratch={sources.eveningScratch}
        deliveryCount={sources.deliveries.length}
        shortItems={sources.shortItems}
        expenseCount={sources.expenses.length}
        actual={parseMoneyToCents(counted)}
        onOpen={(path) =>
          router.push({
            pathname: `/shop/[shopId]/${path}`,
            params: { shopId },
          })
        }
      />

      <FormField
        control={control}
        name='notes'
        label='Notes (optional)'
        multiline
        placeholder='Anything unusual about today'
      />
    </FormScreen>
  );
}
