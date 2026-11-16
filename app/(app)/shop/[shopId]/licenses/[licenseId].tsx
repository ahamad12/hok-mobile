import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ListItem, ListSection } from '@/components/ListItem';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import { StatTile } from '@/components/StatTile';
import { useServerErrors } from '@/features/auth/components';
import {
  useRenewLicense,
  useUpdateLicense,
  useVoidRenewal,
} from '@/features/licenses/api/licenses.mutations';
import {
  useLicense,
  useRenewals,
} from '@/features/licenses/api/licenses.queries';
import { LicenseBadge } from '@/features/licenses/components/LicenseBadge';
import {
  RenewalFields,
  toRenewalInput,
} from '@/features/licenses/components/RenewalFields';
import {
  RenewalFormValues,
  renewalSchema,
} from '@/features/licenses/schemas/licenses.schemas';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { withPageAccess } from '@/features/shops/components/PageGate';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { addDays, isoToBusinessDate, today } from '@/utils/businessDate';
import { formatMoney, parseMoneyToCents } from '@/utils/money';
import { formatShortDate } from '@/utils/time';

function LicenseScreen() {
  const { licenseId } = useLocalSearchParams<{ licenseId: string }>();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const sheet = useRef<AppBottomSheetRef>(null);
  const reason = useRef<ReasonSheetRef>(null);

  const license = useLicense(licenseId);
  const renewals = useRenewals(licenseId);
  const renew = useRenewLicense(shopId, licenseId);
  const update = useUpdateLicense(shopId, licenseId);
  const voidRenewal = useVoidRenewal(shopId, licenseId);

  const { control, handleSubmit, setError, reset } = useForm<RenewalFormValues>(
    {
      resolver: zodResolver(renewalSchema),
      defaultValues: {
        issueDate: '',
        expiryDate: '',
        paymentAmount: '',
        paymentDate: '',
        notes: '',
      },
      mode: 'onTouched',
    },
  );
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'issueDate',
    'expiryDate',
    'paymentAmount',
    'paymentDate',
    'notes',
  ]);

  const l = license.data;
  if (!l) {
    return (
      <FormScreen title='Licence'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  const openRenew = () => {
    // A renewal usually starts the day the current one ends.
    const start = l.currentExpiryDate
      ? isoToBusinessDate(l.currentExpiryDate)
      : today();
    reset({
      issueDate: start,
      expiryDate: addDays(start, 365),
      paymentAmount: '',
      paymentDate: today(),
      notes: '',
    });
    setFormError(null);
    sheet.current?.open();
  };

  const submit = handleSubmit((v) => {
    renew.mutate(toRenewalInput(v, parseMoneyToCents), {
      onSuccess: () => {
        toast.success('Licence renewed');
        sheet.current?.close();
      },
      onError,
    });
  });

  return (
    <FormScreen
      title={l.productName}
      footer={
        manages && l.isActive ? (
          <AppButton onPress={openRenew} iconLeft='RefreshCw' fullWidth>
            Record renewal
          </AppButton>
        ) : undefined
      }>
      <View style={styles.head}>
        <LicenseBadge license={l} />
        <AppText
          variant='bodySmall'
          color='secondary'>{`No. ${l.licenseNumber}`}</AppText>
      </View>
      <View style={styles.tiles}>
        <StatTile
          label='Expires'
          value={
            l.currentExpiryDate ? formatShortDate(l.currentExpiryDate) : '–'
          }
          tone={
            l.isExpired ? 'error' : l.isExpiringSoon ? 'warning' : 'default'
          }
        />
        <StatTile
          label='Days left'
          value={
            l.daysRemaining === null
              ? '–'
              : String(Math.max(0, l.daysRemaining))
          }
          hint={`Reminder ${l.remindDays} days before`}
        />
      </View>

      <ListSection title='History'>
        {(renewals.data ?? []).map((r) => (
          <ListItem
            key={r.id}
            icon={
              r.voidedAt
                ? 'Ban'
                : r.source === 'INITIAL'
                  ? 'BadgePlus'
                  : 'RefreshCw'
            }
            iconTone={r.voidedAt ? 'error' : 'neutral'}
            title={`${formatShortDate(r.issueDate)} → ${formatShortDate(r.expiryDate)}`}
            subtitle={[
              r.source === 'INITIAL' ? 'First issue' : 'Renewal',
              r.paymentAmount ? `Paid ${formatMoney(r.paymentAmount)}` : null,
              r.voidedAt ? `Voided: ${r.voidReason}` : r.notes,
            ]
              .filter(Boolean)
              .join(' · ')}
            chevron={false}
            onPress={
              manages && !r.voidedAt
                ? () =>
                    reason.current?.ask({
                      title: 'Void this renewal?',
                      message:
                        'Use this if it was entered by mistake. The dates fall back to the previous one.',
                      confirmLabel: 'Void renewal',
                      onConfirm: (why) =>
                        voidRenewal
                          .mutateAsync({ renewalId: r.id, reason: why })
                          .then(() => toast.success('Renewal voided')),
                    })
                : undefined
            }
          />
        ))}
      </ListSection>

      {manages ? (
        <ListSection>
          <ListItem
            icon={l.isActive ? 'Archive' : 'ArchiveRestore'}
            title={
              l.isActive
                ? 'Stop tracking this licence'
                : 'Track this licence again'
            }
            subtitle={
              l.isActive ? 'No more reminders; history is kept' : undefined
            }
            chevron={false}
            onPress={() =>
              update.mutate(
                { isActive: !l.isActive },
                {
                  onSuccess: () =>
                    toast.success(
                      l.isActive ? 'Licence archived' : 'Licence active',
                    ),
                },
              )
            }
          />
        </ListSection>
      ) : null}

      <AppBottomSheet ref={sheet} title='Record renewal'>
        <View style={styles.sheet}>
          {formError ? (
            <AppText variant='bodySmall' color='error'>
              {formError}
            </AppText>
          ) : null}
          <RenewalFields control={control} />
          <AppButton onPress={submit} loading={renew.isPending} fullWidth>
            Save renewal
          </AppButton>
        </View>
      </AppBottomSheet>
      <ReasonSheet ref={reason} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  tiles: { flexDirection: 'row', gap: spacing[3] },
  sheet: { paddingHorizontal: spacing[5], gap: spacing[4] },
});

export default withPageAccess('licenses', 'Licence', LicenseScreen);
