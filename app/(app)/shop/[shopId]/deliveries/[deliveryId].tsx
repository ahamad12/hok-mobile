import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Linking, StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { FormSelect } from '@/components/FormSelect';
import { ListItem, ListSection } from '@/components/ListItem';
import { ReasonSheet, ReasonSheetRef } from '@/components/ReasonSheet';
import { StatTile } from '@/components/StatTile';
import { FormField, useServerErrors } from '@/features/auth/components';
import {
  useReceiveDelivery,
  useRecordPayment,
  useUploadDeliveryBill,
  useVoidDelivery,
  useVoidPayment,
} from '@/features/deliveries/api/deliveries.mutations';
import {
  useDelivery,
  useSupplierLookup,
} from '@/features/deliveries/api/deliveries.queries';
import { PaymentMode } from '@/features/deliveries/api/deliveries.types';
import {
  PaymentFormValues,
  paymentSchema,
} from '@/features/deliveries/schemas/deliveries.schemas';
import {
  PAYMENT_MODE,
  PAYMENT_STATUS,
} from '@/features/deliveries/utils/deliveryUtils';
import { FormScreen } from '@/features/shops/components/FormScreen';
import {
  useCapabilities,
  useShopId,
  useShopRole,
} from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { centsToInput, formatMoney, parseMoneyToCents } from '@/utils/money';
import { formatShortDate } from '@/utils/time';

/**
 * One delivery. While PENDING anyone in the shop can fix the items and
 * check it in; once checked in it is locked and (for owners/managers)
 * payable. The bill photo can be attached at any time.
 */
export default function DeliveryScreen() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId: string }>();
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const { canViewPayments } = useCapabilities();
  const toast = useToast();
  const paySheet = useRef<AppBottomSheetRef>(null);
  const reason = useRef<ReasonSheetRef>(null);

  const detail = useDelivery(deliveryId);
  const supplier = useSupplierLookup(shopId);
  const pay = useRecordPayment(shopId, deliveryId);
  const voidPayment = useVoidPayment(shopId, deliveryId);
  const voidDelivery = useVoidDelivery(shopId, deliveryId);
  const receive = useReceiveDelivery(shopId, deliveryId);
  const uploadBill = useUploadDeliveryBill(shopId, deliveryId);

  const { control, handleSubmit, setError, reset } = useForm<PaymentFormValues>(
    {
      resolver: zodResolver(paymentSchema),
      defaultValues: { amount: '', paymentMode: 'CASH', notes: '' },
      mode: 'onTouched',
    },
  );
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'amount',
    'paymentMode',
    'notes',
  ]);

  const data = detail.data;
  if (!data) {
    return (
      <FormScreen title='Delivery'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }
  const d = data.delivery;
  const voided = !!d.voidedAt;
  const pending = d.status === 'PENDING' && !voided;
  const st = PAYMENT_STATUS[d.paymentStatus];

  const checkIn = () =>
    receive.mutate(undefined, {
      onSuccess: () => toast.success('Items locked', 'Delivery checked in'),
    });

  const editItems = () =>
    router.push({
      pathname: '/shop/[shopId]/deliveries/edit',
      params: { shopId, deliveryId },
    });

  const attachBill = async (source: 'camera' | 'library') => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error('Allow access in Settings to attach the bill');
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.7,
    };
    const picked =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    const asset = picked.canceled ? undefined : picked.assets[0];
    if (!asset) return;
    uploadBill.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? 'bill.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      },
      { onSuccess: () => toast.success('Bill attached') },
    );
  };

  const openPay = () => {
    reset({
      amount: centsToInput(d.balanceDueCents),
      paymentMode: 'CASH',
      notes: '',
    });
    setFormError(null);
    paySheet.current?.open();
  };

  const submitPay = handleSubmit((v) => {
    pay.mutate(
      {
        amountCents: parseMoneyToCents(v.amount) ?? 0,
        paymentMode: v.paymentMode,
        notes: v.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Payment recorded');
          paySheet.current?.close();
        },
        onError,
      },
    );
  });

  return (
    <FormScreen
      title={supplier(d.supplierId)?.name ?? 'Delivery'}
      footer={
        pending ? (
          <AppButton
            variant='brand'
            onPress={checkIn}
            loading={receive.isPending}
            iconLeft='PackageCheck'
            fullWidth>
            Check in
          </AppButton>
        ) : manages && !voided && d.balanceDueCents > 0 ? (
          <AppButton onPress={openPay} iconLeft='Banknote' fullWidth>
            Record payment
          </AppButton>
        ) : undefined
      }>
      <View style={styles.chips}>
        {!voided ? (
          <Badge
            label={pending ? 'Awaiting check-in' : 'Checked in'}
            tone={pending ? 'warning' : 'success'}
          />
        ) : null}
        {voided || (canViewPayments && !pending) ? (
          <Badge
            label={voided ? 'Voided' : st.label}
            tone={voided ? 'neutral' : st.tone}
          />
        ) : null}
        <Badge label={formatShortDate(d.deliveredAt)} />
      </View>

      <View style={styles.tiles}>
        <StatTile label='Total' value={formatMoney(d.totalAmountCents)} />
        {canViewPayments ? (
          <StatTile
            label='Still owed'
            value={formatMoney(d.balanceDueCents)}
            tone={d.balanceDueCents > 0 && !voided ? 'error' : 'default'}
            hint={`Paid ${formatMoney(d.totalPaidCents)}`}
          />
        ) : null}
      </View>

      <ListSection title='Items'>
        {data.lineItems.map((l) => (
          <ListItem
            key={l.id}
            icon={l.hasDiscrepancy ? 'TriangleAlert' : 'Package'}
            iconTone={l.hasDiscrepancy ? 'warning' : 'neutral'}
            title={l.productName}
            subtitle={`${l.quantityReceived} of ${l.quantityOrdered} ${l.unit} × ${formatMoney(l.unitPriceCents)}${l.discrepancyNote ? ` · ${l.discrepancyNote}` : ''}`}
            value={formatMoney(l.lineTotalCents)}
          />
        ))}
        {pending ? (
          <ListItem
            icon='PencilLine'
            iconTone='brand'
            title='Edit items'
            subtitle='Fix quantities or prices before checking in'
            onPress={editItems}
          />
        ) : null}
      </ListSection>

      <ListSection
        title='Bill'
        footer={
          uploadBill.isPending ? 'Uploading the bill…' : 'Photo of the supplier invoice.'
        }>
        {d.billUrl ? (
          <ListItem
            icon='FileText'
            iconTone='success'
            title='View bill'
            onPress={() => {
              if (d.billUrl) void Linking.openURL(d.billUrl);
            }}
          />
        ) : null}
        {!voided ? (
          <>
            <ListItem
              icon='Camera'
              title={d.billUrl ? 'Retake photo' : 'Take a photo of the bill'}
              onPress={() => void attachBill('camera')}
            />
            <ListItem
              icon='Image'
              title='Choose from photos'
              onPress={() => void attachBill('library')}
            />
          </>
        ) : null}
      </ListSection>

      {/* Payment writes are server-gated; staff also don't see payments.
          Pending deliveries aren't payable until checked in. */}
      {canViewPayments && !pending ? (
        <ListSection title='Payments'>
          {data.payments.length === 0 ? (
            <ListItem icon='Banknote' title='No payments yet' />
          ) : (
            data.payments.map((p) => (
              <ListItem
                key={p.id}
                icon={p.voidedAt ? 'Ban' : 'Banknote'}
                iconTone={p.voidedAt ? 'error' : 'success'}
                title={`${PAYMENT_MODE[p.paymentMode]}${p.voidedAt ? ' · voided' : ''}`}
                subtitle={[formatShortDate(p.paidAt), p.notes, p.voidReason]
                  .filter(Boolean)
                  .join(' · ')}
                value={formatMoney(p.amountCents)}
                chevron={false}
                onPress={
                  manages && !p.voidedAt && !voided
                    ? () =>
                        reason.current?.ask({
                          title: 'Void this payment?',
                          message: `${formatMoney(p.amountCents)} goes back onto what is owed.`,
                          confirmLabel: 'Void payment',
                          onConfirm: (r) =>
                            voidPayment
                              .mutateAsync({ paymentId: p.id, reason: r })
                              .then(() => toast.success('Payment voided')),
                        })
                    : undefined
                }
              />
            ))
          )}
        </ListSection>
      ) : null}

      {manages && !voided ? (
        <ListSection>
          <ListItem
            icon='Ban'
            title='Void delivery'
            subtitle='Kept on record, removed from totals'
            destructive
            chevron={false}
            onPress={() =>
              reason.current?.ask({
                title: 'Void this delivery?',
                message:
                  'It stops counting toward what you owe and the day totals.',
                confirmLabel: 'Void delivery',
                onConfirm: (r) =>
                  voidDelivery
                    .mutateAsync(r)
                    .then(() => toast.success('Delivery voided')),
              })
            }
          />
        </ListSection>
      ) : null}
      {d.voidReason ? (
        <AppText
          variant='caption'
          color='tertiary'>{`Voided: ${d.voidReason}`}</AppText>
      ) : null}

      <AppBottomSheet
        ref={paySheet}
        title='Record payment'
        subtitle={`Owed ${formatMoney(d.balanceDueCents)}`}>
        <View style={styles.sheet}>
          {formError ? (
            <AppText variant='bodySmall' color='error'>
              {formError}
            </AppText>
          ) : null}
          <FormField
            control={control}
            name='amount'
            label='Amount'
            keyboardType='decimal-pad'
          />
          <FormSelect<PaymentFormValues, PaymentMode>
            control={control}
            name='paymentMode'
            label='Paid by'
            options={(Object.keys(PAYMENT_MODE) as PaymentMode[]).map((m) => ({
              value: m,
              label: PAYMENT_MODE[m],
            }))}
          />
          <FormField control={control} name='notes' label='Note (optional)' />
          <AppButton onPress={submitPay} loading={pay.isPending} fullWidth>
            Record payment
          </AppButton>
        </View>
      </AppBottomSheet>
      <ReasonSheet ref={reason} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[1] },
  tiles: { flexDirection: 'row', gap: spacing[3] },
  sheet: { paddingHorizontal: spacing[5], gap: spacing[4] },
});
