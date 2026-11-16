import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { Badge } from '@/components/Badge';
import { ListItem, ListSection } from '@/components/ListItem';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SkeletonRow } from '@/components/Skeleton';
import {
  useSupplierLookup,
  useSupplierOutstanding,
} from '@/features/deliveries/api/deliveries.queries';
import {
  useDailySummaries,
  useProfitPreview,
} from '@/features/money/api/money.queries';
import {
  DAY_STATUS,
  dayStatus,
  varianceTone,
} from '@/features/money/utils/moneyUtils';
import { ShopTabScreen } from '@/features/shops/components/ShopTabScreen';
import {
  useCapabilities,
  useShopId,
} from '@/features/shops/hooks/useShopContext';
import {
  addDays,
  formatBusinessDay,
  isoToBusinessDate,
  monthRange,
  today,
} from '@/utils/businessDate';
import { formatMoney } from '@/utils/money';

type Period = 'week' | 'month';

/**
 * Finance (owners and managers): today's money first (till, day close,
 * expenses), then three short stories for the chosen period (profit, cash
 * variance, payables) and the daily closes behind them. The P&L lives here
 * and nowhere else.
 */
export default function FinanceScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const caps = useCapabilities();
  const [period, setPeriod] = useState<Period>('month');

  const day = today();
  const range =
    period === 'month' ? monthRange(day) : { from: addDays(day, -6), to: day };

  const profit = useProfitPreview(
    shopId,
    range.from,
    range.to,
    caps.canViewProfit,
  );
  const closes = useDailySummaries(shopId);
  const owed = useSupplierOutstanding(shopId);
  const supplier = useSupplierLookup(shopId);

  const inPeriod = (closes.data?.summaries ?? []).filter((s) => {
    const d = isoToBusinessDate(s.date);
    return d >= range.from && d <= range.to;
  });
  const finalized = inPeriod.filter((s) => s.status === 'FINALIZED');
  const short = finalized.filter((s) => (s.variance ?? 0) < 0);
  const netVariance = finalized.reduce((n, s) => n + (s.variance ?? 0), 0);

  const payables = (owed.data ?? [])
    .filter((b) => b.outstandingCents > 0)
    .sort((a, b) => b.outstandingCents - a.outstandingCents);
  const owedTotal = payables.reduce((n, b) => n + b.outstandingCents, 0);

  const go = (path: string, extra: Record<string, string> = {}) =>
    router.push({
      pathname: `/shop/[shopId]/${path}`,
      params: { shopId, ...extra },
    });

  const label =
    period === 'month'
      ? `${formatBusinessDay(range.from)} to now`
      : 'The last 7 days';

  return (
    <ShopTabScreen
      title='Finance'
      subtitle={label}
      onRefresh={() =>
        Promise.all([profit.refetch(), closes.refetch(), owed.refetch()])
      }
      toolbar={
        <SegmentedControl<Period>
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'week', label: '7 days' },
            { value: 'month', label: 'This month' },
          ]}
        />
      }>
      <ListSection title='Today'>
        <ListItem
          icon='Banknote'
          title='Till'
          subtitle='Cash in and out, expected balance'
          onPress={() => go('records/till')}
        />
        <ListItem
          icon='CalendarCheck'
          title='Day close'
          subtitle="Count the till and finalize today's summary"
          onPress={() => go('close-day', { date: day })}
        />
        <ListItem
          icon='Receipt'
          title='Expenses'
          subtitle='Bills and running costs'
          onPress={() => go('expenses')}
        />
      </ListSection>

      <ListSection
        title='Profit'
        footer={
          profit.data?.uncoveredDates.length
            ? `${profit.data.uncoveredDates.length} days have no closed summary yet, so totals may be low.`
            : 'From closed days, deliveries and expenses.'
        }>
        {profit.isLoading ? (
          <SkeletonRow />
        ) : profit.data ? (
          <>
            <ListItem
              icon='TrendingUp'
              title='Revenue'
              value={formatMoney(profit.data.totalRevenue)}
              chevron={false}
            />
            <ListItem
              icon='TrendingDown'
              title='Costs'
              value={formatMoney(profit.data.totalExpense)}
              chevron={false}
            />
            <ListItem
              icon='Scale'
              title='Net profit'
              subtitle={`${profit.data.profitMargin.toFixed(0)}% margin`}
              value={formatMoney(profit.data.netProfit)}
              chevron={false}
            />
          </>
        ) : (
          <ListItem icon='CloudOff' title="Couldn't load the period" />
        )}
      </ListSection>

      <ListSection title='Cash'>
        <ListItem
          icon={short.length ? 'TriangleAlert' : 'CircleCheck'}
          iconTone={short.length ? 'warning' : 'success'}
          title={
            finalized.length === 0
              ? 'No closed days yet'
              : short.length
                ? `Short on ${short.length} of ${finalized.length} days`
                : `Balanced on all ${finalized.length} days`
          }
          subtitle={
            finalized.length
              ? `Net ${netVariance < 0 ? 'short' : 'over'} ${formatMoney(Math.abs(netVariance))}`
              : 'Variance shows once days are finalized'
          }
          chevron={false}
        />
      </ListSection>

      {caps.canViewPayments ? (
        <ListSection title='Payables'>
          <ListItem
            icon='Factory'
            title={
              owedTotal > 0
                ? `${formatMoney(owedTotal)} owed to ${payables.length} ${payables.length === 1 ? 'supplier' : 'suppliers'}`
                : 'Nothing owed to suppliers'
            }
            subtitle={
              payables[0]
                ? `Most to ${supplier(payables[0].supplierId)?.name ?? 'one supplier'}`
                : undefined
            }
            onPress={() => go('records/deliveries')}
          />
        </ListSection>
      ) : null}

      <ListSection title='Daily closes'>
        {closes.isLoading ? (
          <SkeletonRow />
        ) : inPeriod.length === 0 ? (
          <ListItem icon='CalendarDays' title='No days closed in this period' />
        ) : (
          inPeriod.map((s) => {
            const st = dayStatus(s);
            const tone = varianceTone(s.variance);
            return (
              <ListItem
                key={s.id}
                icon='CalendarDays'
                title={formatBusinessDay(isoToBusinessDate(s.date))}
                subtitle={`Closed at ${formatMoney(s.closingBalance)}${s.variance ? ` · ${s.variance > 0 ? 'over' : 'short'} ${formatMoney(Math.abs(s.variance))}` : ''}`}
                trailing={
                  <Badge
                    label={DAY_STATUS[st].label}
                    tone={
                      tone === 'error' && st === 'closed'
                        ? 'error'
                        : DAY_STATUS[st].tone
                    }
                  />
                }
                onPress={() => go('day/[summaryId]', { summaryId: s.id })}
              />
            );
          })
        )}
      </ListSection>
    </ShopTabScreen>
  );
}
