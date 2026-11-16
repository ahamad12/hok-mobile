import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FormSelect } from '@/components/FormSelect';
import { IconButton } from '@/components/IconButton';
import { useColors } from '@/contexts/ColorContext';
import { FormField, useServerErrors } from '@/features/auth/components';
import {
  useCreateDelivery,
  useUpdateDelivery,
} from '@/features/deliveries/api/deliveries.mutations';
import {
  useDelivery,
  useSuppliers,
} from '@/features/deliveries/api/deliveries.queries';
import { DeliveryLineItem } from '@/features/deliveries/api/deliveries.types';
import {
  DeliveryFormValues,
  deliverySchema,
  emptyLineItem,
} from '@/features/deliveries/schemas/deliveries.schemas';
import { lineTotalCents } from '@/features/deliveries/utils/deliveryUtils';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { borderRadius, spacing } from '@/theme/Common';
import { centsToInput, formatMoney, parseMoneyToCents } from '@/utils/money';

const toFormLine = (l: DeliveryLineItem) => ({
  productName: l.productName,
  quantityOrdered: String(l.quantityOrdered),
  quantityReceived: String(l.quantityReceived),
  unit: l.unit,
  unitPrice: centsToInput(l.unitPriceCents),
  discrepancyNote: l.discrepancyNote ?? '',
});

/**
 * Record a delivery, or (with ?deliveryId=, via deliveries/edit) fix one
 * that is still waiting to be checked in. Anyone in the shop can do both;
 * once checked in the lines are locked.
 */
export default function DeliveryFormScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const { deliveryId } = useLocalSearchParams<{ deliveryId?: string }>();
  const editing = !!deliveryId;
  const { manages } = useShopRole();
  const { colors } = useColors();
  const toast = useToast();
  const suppliers = useSuppliers(shopId);
  const existing = useDelivery(deliveryId ?? '');
  const create = useCreateDelivery(shopId);
  const update = useUpdateDelivery(shopId, deliveryId ?? '');
  const active = (suppliers.data ?? []).filter((s) => s.isActive);

  const { control, handleSubmit, setError, reset } =
    useForm<DeliveryFormValues>({
      resolver: zodResolver(deliverySchema),
      defaultValues: { supplierId: '', lineItems: [emptyLineItem] },
      mode: 'onTouched',
    });
  const items = useFieldArray({ control, name: 'lineItems' });
  const lines = useWatch({ control, name: 'lineItems' });
  const { formError, setFormError, onError } = useServerErrors(setError, [
    'supplierId',
  ]);

  // Prefill once the delivery being edited has loaded.
  const loaded = existing.data;
  useEffect(() => {
    if (!loaded) return;
    reset({
      supplierId: loaded.delivery.supplierId,
      lineItems: loaded.lineItems.map(toFormLine),
    });
  }, [loaded, reset]);

  const total = (lines ?? []).reduce(
    (n, l) => n + (lineTotalCents(l.quantityReceived, l.unitPrice) ?? 0),
    0,
  );

  const submit = handleSubmit((v) => {
    setFormError(null);
    const lineItems = v.lineItems.map((l) => ({
      productName: l.productName.trim(),
      quantityOrdered: Number(l.quantityOrdered),
      quantityReceived: Number(l.quantityReceived),
      unit: l.unit.trim(),
      unitPriceCents: parseMoneyToCents(l.unitPrice) ?? 0,
      discrepancyNote: l.discrepancyNote.trim() || undefined,
    }));
    if (editing) {
      update.mutate(
        { supplierId: v.supplierId, lineItems },
        {
          onSuccess: () => {
            toast.success('Delivery updated');
            router.back();
          },
          onError,
        },
      );
      return;
    }
    create.mutate(
      { supplierId: v.supplierId, lineItems },
      {
        onSuccess: (d) => {
          toast.success(
            'Check the items in once they are counted',
            'Delivery logged',
          );
          router.replace({
            pathname: '/shop/[shopId]/deliveries/[deliveryId]',
            params: { shopId, deliveryId: d.id },
          });
        },
        onError,
      },
    );
  });

  const title = editing ? 'Edit delivery' : 'Record delivery';

  if (editing && !loaded) {
    return (
      <FormScreen title={title} dismiss='close'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  if (editing && loaded && loaded.delivery.status !== 'PENDING') {
    return (
      <FormScreen title={title} dismiss='close'>
        <EmptyState
          icon='Lock'
          title='Already checked in'
          body='Checked-in deliveries are locked. An owner or manager can void it so it can be logged again.'
        />
      </FormScreen>
    );
  }

  if (!editing && !suppliers.isLoading && active.length === 0) {
    return (
      <FormScreen title={title}>
        <EmptyState
          icon='Factory'
          title='Add a supplier first'
          body={
            manages
              ? 'Deliveries come from a supplier.'
              : 'Ask an owner or manager to add the supplier.'
          }
          actionLabel={manages ? 'Add supplier' : undefined}
          actionIcon='Plus'
          onAction={() =>
            router.replace({
              pathname: '/shop/[shopId]/suppliers',
              params: { shopId },
            })
          }
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={title}
      dismiss='close'
      error={formError}
      footer={
        <AppButton
          onPress={submit}
          loading={create.isPending || update.isPending}
          fullWidth>
          {`Save · ${formatMoney(total)}`}
        </AppButton>
      }>
      <FormSelect
        control={control}
        name='supplierId'
        label='Supplier'
        placeholder='Choose a supplier'
        options={active.map((s) => ({
          value: s.id,
          label: s.name,
          description: s.phone ?? undefined,
        }))}
      />

      {items.fields.map((f, i) => {
        const line = lines?.[i];
        const lt = line
          ? lineTotalCents(line.quantityReceived, line.unitPrice)
          : null;
        const short =
          line && Number(line.quantityReceived) < Number(line.quantityOrdered);
        return (
          <View
            key={f.id}
            style={[
              styles.line,
              { backgroundColor: colors.background.surface },
            ]}>
            <View style={styles.lineHead}>
              <AppText
                variant='label'
                color='secondary'>{`Item ${i + 1}`}</AppText>
              <AppText variant='label'>
                {lt !== null ? formatMoney(lt) : ''}
              </AppText>
              {items.fields.length > 1 ? (
                <IconButton
                  icon='Trash2'
                  label={`Remove item ${i + 1}`}
                  size={36}
                  onPress={() => items.remove(i)}
                  style={{ backgroundColor: colors.background.default }}
                />
              ) : null}
            </View>
            <FormField
              control={control}
              name={`lineItems.${i}.productName`}
              label='Product'
              placeholder='e.g. Milk 1L'
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <FormField
                  control={control}
                  name={`lineItems.${i}.quantityOrdered`}
                  label='Ordered'
                  keyboardType='decimal-pad'
                />
              </View>
              <View style={styles.flex}>
                <FormField
                  control={control}
                  name={`lineItems.${i}.quantityReceived`}
                  label='Received'
                  keyboardType='decimal-pad'
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex}>
                <FormField
                  control={control}
                  name={`lineItems.${i}.unit`}
                  label='Unit'
                  placeholder='pcs, kg, box'
                />
              </View>
              <View style={styles.flex}>
                <FormField
                  control={control}
                  name={`lineItems.${i}.unitPrice`}
                  label='Unit price'
                  placeholder='0.00'
                  keyboardType='decimal-pad'
                />
              </View>
            </View>
            {short ? (
              <FormField
                control={control}
                name={`lineItems.${i}.discrepancyNote`}
                label='What was short or damaged?'
                placeholder='Optional note'
              />
            ) : null}
          </View>
        );
      })}

      <AppButton
        variant='secondary'
        iconLeft='Plus'
        onPress={() => items.append(emptyLineItem)}>
        Add item
      </AppButton>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  line: { borderRadius: borderRadius.xl, padding: spacing[4], gap: spacing[3] },
  lineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', gap: spacing[3] },
  flex: { flex: 1 },
});
