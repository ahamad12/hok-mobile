import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { Badge } from '@/components/Badge';
import { ConfirmSheet, ConfirmSheetRef } from '@/components/ConfirmSheet';
import { ListItem, ListSection } from '@/components/ListItem';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StatTile } from '@/components/StatTile';
import { FormField, useServerErrors } from '@/features/auth/components';
import {
  useMovePack,
  useRecordScan,
  useReturnPack,
} from '@/features/scratch/api/scratch.mutations';
import {
  useGameLookup,
  useScratchPack,
  useScratchScans,
} from '@/features/scratch/api/scratch.queries';
import { ShiftPeriod } from '@/features/scratch/api/scratch.types';
import {
  RecordScanFormValues,
  recordScanSchema,
} from '@/features/scratch/schemas/scratch.schemas';
import {
  gameTitle,
  SHIFT_LABEL,
  suggestedShift,
} from '@/features/scratch/utils/scratchUtils';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { today } from '@/utils/businessDate';
import { formatMoney } from '@/utils/money';
import { formatRelativeTime, formatShortDate } from '@/utils/time';

const STATUS_TONE = {
  ACTIVE: 'success',
  FINISHED: 'neutral',
  RETURNED: 'warning',
} as const;

export default function PackScreen() {
  const { packId, shift } = useLocalSearchParams<{
    packId: string;
    shift?: ShiftPeriod;
  }>();
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const confirm = useRef<ConfirmSheetRef>(null);

  const pack = useScratchPack(packId);
  const game = useGameLookup(shopId)(pack.data?.gameId ?? '');
  const day = today();
  const scans = useScratchScans(shopId, day);
  const record = useRecordScan(shopId, packId);
  const move = useMovePack(shopId, packId);
  const ret = useReturnPack(shopId, packId);

  const packScans = (scans.data ?? []).filter((s) => s.packId === packId);
  const done = (p: ShiftPeriod) =>
    packScans.some((s) => s.shiftPeriod === p && !s.voidedAt);

  const { control, handleSubmit, setError, setValue, reset } =
    useForm<RecordScanFormValues>({
      resolver: zodResolver(recordScanSchema),
      defaultValues: { shiftPeriod: shift ?? 'MORNING', scannedSerial: '' },
      mode: 'onTouched',
    });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'shiftPeriod',
    'scannedSerial',
  ]);

  // Pick the likely shift once today's scans are known (unless one was asked for).
  useEffect(() => {
    if (!shift && scans.data) {
      setValue('shiftPeriod', suggestedShift(scans.data, packId));
    }
  }, [scans.data, shift, packId, setValue]);

  const p = pack.data;
  if (!p) {
    return (
      <FormScreen title='Pack'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  const submit = handleSubmit((v) => {
    setFormError(null);
    record.mutate(
      {
        scanDate: day,
        shiftPeriod: v.shiftPeriod,
        scannedSerial: v.scannedSerial,
      },
      {
        onSuccess: (scan) => {
          toast.success(
            `${scan.ticketsSoldSincePrevious} sold · ${formatMoney(scan.revenueCents)}`,
            `${SHIFT_LABEL[scan.shiftPeriod]} scan saved`,
          );
          reset({ shiftPeriod: v.shiftPeriod, scannedSerial: '' });
          if (shift) router.back();
        },
        onError,
      },
    );
  });

  const active = p.status === 'ACTIVE';
  const otherLocation = p.location === 'DISPLAY' ? 'BACKSTOCK' : 'DISPLAY';

  return (
    <FormScreen
      title={gameTitle(game)}
      error={formError}
      footer={
        active ? (
          <AppButton
            onPress={submit}
            loading={record.isPending}
            fullWidth
            iconLeft='ScanLine'>
            Save scan
          </AppButton>
        ) : undefined
      }>
      <View style={styles.badges}>
        <Badge
          label={
            p.status === 'ACTIVE'
              ? 'Active'
              : p.status === 'FINISHED'
                ? 'Finished'
                : 'Returned'
          }
          tone={STATUS_TONE[p.status]}
        />
        <Badge label={p.location === 'DISPLAY' ? 'On display' : 'Backstock'} />
      </View>

      <View style={styles.tiles}>
        <StatTile
          label='Ticket price'
          value={game ? formatMoney(game.priceCents) : '–'}
        />
        <StatTile
          label='Tickets in pack'
          value={game ? String(game.ticketsPerPack) : '–'}
          hint={`Starts at ${p.serialStart}`}
        />
      </View>

      {active ? (
        <View style={styles.form}>
          <Controller
            control={control}
            name='shiftPeriod'
            render={({ field }) => (
              <SegmentedControl<ShiftPeriod>
                value={field.value}
                onChange={field.onChange}
                options={[
                  {
                    value: 'MORNING',
                    label: done('MORNING') ? 'Morning ✓' : 'Morning',
                  },
                  {
                    value: 'EVENING',
                    label: done('EVENING') ? 'Evening ✓' : 'Evening',
                  },
                ]}
              />
            )}
          />
          <FormField
            control={control}
            name='scannedSerial'
            label='Next ticket serial'
            placeholder='e.g. 027'
            helperText='The 3-digit serial of the next ticket to sell. Sales are worked out from the last scan.'
            keyboardType='number-pad'
            maxLength={3}
          />
        </View>
      ) : null}

      <ListSection title="Today's scans">
        {packScans.length === 0 ? (
          <ListItem icon='ScanLine' title='Not scanned today' />
        ) : (
          packScans.map((s) => (
            <ListItem
              key={s.id}
              icon='ScanLine'
              iconTone={s.voidedAt ? 'error' : 'success'}
              title={`${SHIFT_LABEL[s.shiftPeriod]} · serial ${s.scannedSerial}`}
              subtitle={`${s.ticketsSoldSincePrevious} sold · ${s.ticketsRemaining} left · ${formatRelativeTime(s.createdAt)}`}
              value={s.voidedAt ? 'Voided' : formatMoney(s.revenueCents)}
            />
          ))
        )}
      </ListSection>

      <ListSection title='Pack'>
        <ListItem
          icon='CalendarDays'
          title='Received'
          value={formatShortDate(p.receivedAt)}
        />
        {active ? (
          <ListItem
            icon={otherLocation === 'DISPLAY' ? 'Store' : 'Archive'}
            title={
              otherLocation === 'DISPLAY'
                ? 'Put on display'
                : 'Move to backstock'
            }
            onPress={() =>
              move.mutate(otherLocation, {
                onSuccess: () =>
                  toast.success(
                    otherLocation === 'DISPLAY'
                      ? 'Now on display'
                      : 'Moved to backstock',
                  ),
              })
            }
            disabled={move.isPending}
          />
        ) : null}
        {active && manages ? (
          <ListItem
            icon='Undo2'
            title='Return pack'
            subtitle='Send unsold tickets back to the supplier'
            destructive
            onPress={() =>
              confirm.current?.ask({
                title: 'Return this pack?',
                message: 'It stops being scanned. This cannot be undone.',
                confirmLabel: 'Return pack',
                icon: 'Undo2',
                onConfirm: () =>
                  ret
                    .mutateAsync(undefined)
                    .then(() => toast.success('Pack returned')),
              })
            }
            chevron={false}
          />
        ) : null}
      </ListSection>
      <ConfirmSheet ref={confirm} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing[2] },
  tiles: { flexDirection: 'row', gap: spacing[3] },
  form: { gap: spacing[4] },
});
