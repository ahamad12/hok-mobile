import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { Skeleton } from '@/components/Skeleton';
import { useColors } from '@/contexts/ColorContext';
import { DailySummary } from '@/features/money/api/money.types';
import { dayStatus } from '@/features/money/utils/moneyUtils';
import { borderRadius, spacing } from '@/theme/Common';

export type DayStep = 'morning' | 'evening' | 'close';

type Props = {
  /** "Today · Sat 7 Nov" */
  dateLabel: string;
  loading: boolean;
  morningScans: number;
  eveningScans: number;
  /** Active packs on display: how many a full shift scan covers. */
  displayPacks: number | undefined;
  summary: DailySummary | null | undefined;
  canDraftClose: boolean;
  canFinalize: boolean;
  onStep: (step: DayStep) => void;
  onOpenSummary: (summary: DailySummary) => void;
};

type StepState = 'done' | 'partial' | 'todo';

/**
 * The shop's day at a glance: morning scan, evening scan, close. Built from
 * GET /scratch/scans (which shifts were scanned) and the day's summary
 * (GET /daily-summaries/by-date: 404 = not started, DRAFT, FINALIZED).
 * The API does not enforce shift times, so the card never blocks a step.
 */
export function DayCard({
  dateLabel,
  loading,
  morningScans,
  eveningScans,
  displayPacks,
  summary,
  canDraftClose,
  canFinalize,
  onStep,
  onOpenSummary,
}: Props) {
  const { colors } = useColors();
  const status = dayStatus(summary);

  const scanState = (n: number): StepState =>
    n === 0
      ? 'todo'
      : displayPacks !== undefined && n < displayPacks
        ? 'partial'
        : 'done';
  const morning = scanState(morningScans);
  const evening = scanState(eveningScans);
  const close: StepState =
    status === 'closed' ? 'done' : status === 'draft' ? 'partial' : 'todo';

  const scanDetail = (n: number) =>
    n === 0
      ? 'Not scanned'
      : displayPacks
        ? `${Math.min(n, displayPacks)} of ${displayPacks} packs`
        : `${n} ${n === 1 ? 'pack' : 'packs'}`;

  const closeDetail =
    status === 'closed'
      ? 'Finalized'
      : status === 'draft'
        ? canFinalize
          ? 'Draft saved · ready to finalize'
          : 'Draft saved · waiting for owner or manager'
        : 'Not started';

  // Next thing to do, in order; scans can be redone, so they never block.
  let cta: { label: string; onPress: () => void } | null = null;
  let note: string | null = null;
  if (morning !== 'done') {
    cta = { label: 'Scan morning', onPress: () => onStep('morning') };
  } else if (evening !== 'done') {
    cta = { label: 'Scan evening', onPress: () => onStep('evening') };
  } else if (status === 'not_started') {
    if (canDraftClose)
      cta = { label: 'Close the day', onPress: () => onStep('close') };
    else note = 'An owner, manager or supervisor closes the day.';
  } else if (status === 'draft' && summary) {
    if (canFinalize)
      cta = {
        label: 'Review & finalize',
        onPress: () => onOpenSummary(summary),
      };
    else note = 'Draft saved. An owner or manager finalizes it.';
  }

  const steps: {
    key: DayStep;
    title: string;
    detail: string;
    state: StepState;
  }[] = [
    {
      key: 'morning',
      title: 'Morning scan',
      detail: scanDetail(morningScans),
      state: morning,
    },
    {
      key: 'evening',
      title: 'Evening scan',
      detail: scanDetail(eveningScans),
      state: evening,
    },
    { key: 'close', title: 'Close day', detail: closeDetail, state: close },
  ];
  const allDone = steps.every((s) => s.state === 'done');

  return (
    <View style={[styles.card, { backgroundColor: colors.background.surface }]}>
      <View style={styles.head}>
        <AppText variant='label' color='secondary'>
          {dateLabel}
        </AppText>
        <AppText variant='h4'>{allDone ? 'Day closed' : 'Your day'}</AppText>
      </View>

      {loading ? (
        <View style={styles.steps}>
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </View>
      ) : (
        <View style={styles.steps}>
          {steps.map((s, i) => {
            const tappable =
              s.key !== 'close' ||
              (status === 'draft' && !!summary) ||
              (status === 'closed' && !!summary) ||
              canDraftClose;
            return (
              <Pressable
                key={s.key}
                disabled={!tappable}
                onPress={() =>
                  s.key === 'close' && summary
                    ? onOpenSummary(summary)
                    : onStep(s.key)
                }
                accessibilityRole='button'
                accessibilityLabel={`${s.title}: ${s.detail}`}
                style={({ pressed }) => [
                  styles.step,
                  pressed && { backgroundColor: colors.background.overlay },
                ]}>
                <View style={styles.rail}>
                  <StepDot state={s.state} />
                  {i < steps.length - 1 ? (
                    <View
                      style={[
                        styles.line,
                        {
                          backgroundColor:
                            s.state === 'done'
                              ? colors.brand.accent
                              : colors.border.subtle,
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.stepBody}>
                  <AppText variant='body' weight='semibold'>
                    {s.title}
                  </AppText>
                  <AppText variant='bodySmall' color='secondary'>
                    {s.detail}
                  </AppText>
                </View>
                {tappable ? (
                  <AppIcon
                    name='ChevronRight'
                    size={18}
                    color={colors.icon.tertiary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      {!loading && cta ? (
        <AppButton onPress={cta.onPress} iconRight='ArrowRight'>
          {cta.label}
        </AppButton>
      ) : null}
      {!loading && note ? (
        <AppText variant='bodySmall' color='tertiary'>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

function StepDot({ state }: { state: StepState }) {
  const { colors } = useColors();
  if (state === 'done') {
    return (
      <View style={[styles.dot, { backgroundColor: colors.brand.accent }]}>
        <AppIcon
          name='Check'
          size={14}
          color={colors.text.white}
          strokeWidth={3}
        />
      </View>
    );
  }
  return (
    <View
      style={[
        styles.dot,
        styles.ring,
        {
          backgroundColor: colors.background.default,
          borderColor:
            state === 'partial' ? colors.brand.accent : colors.icon.tertiary,
        },
      ]}>
      {state === 'partial' ? (
        <View style={[styles.half, { backgroundColor: colors.brand.accent }]} />
      ) : null}
    </View>
  );
}

const DOT = 24;

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius['3xl'],
    padding: spacing[5],
    gap: spacing[4],
  },
  head: { gap: 2 },
  steps: { gap: 0 },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[1],
  },
  rail: { alignItems: 'center', width: DOT },
  line: {
    width: 2,
    flex: 1,
    minHeight: 22,
    marginVertical: 2,
    borderRadius: 1,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { borderWidth: 2 },
  half: { width: 10, height: 10, borderRadius: 5 },
  stepBody: { flex: 1, gap: 2, paddingBottom: spacing[3] },
});
