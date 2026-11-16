import { useMutation, useQueryClient } from '@tanstack/react-query';

import { moneyKeys } from '@/features/money/api/query-keys';

import {
  createCategory,
  createDelivery,
  createSupplier,
  receiveDelivery,
  recordPayment,
  updateCategory,
  updateDelivery,
  updateSupplier,
  uploadDeliveryBill,
  voidDelivery,
  voidPayment,
} from './deliveries.api';
import {
  BillFile,
  CategoryInput,
  CreateDeliveryInput,
  RecordPaymentInput,
  SupplierInput,
  UpdateDeliveryInput,
} from './deliveries.types';
import { deliveryKeys } from './query-keys';

const useRefreshDeliveries = (shopId: string) => {
  const qc = useQueryClient();
  return (deliveryId?: string) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: deliveryKeys.shop(shopId) }),
      deliveryId
        ? qc.invalidateQueries({ queryKey: deliveryKeys.detail(deliveryId) })
        : null,
      // Delivery payments and totals feed the till and daily summary.
      qc.invalidateQueries({ queryKey: moneyKeys.shop(shopId) }),
    ]);
};

export const useCreateDelivery = (shopId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: (input: Omit<CreateDeliveryInput, 'shopId'>) =>
      createDelivery({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: () => refresh(),
  });
};

export const useUpdateDelivery = (shopId: string, deliveryId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: (input: UpdateDeliveryInput) =>
      updateDelivery(deliveryId, input),
    meta: { silent: true },
    onSuccess: () => refresh(deliveryId),
  });
};

export const useReceiveDelivery = (shopId: string, deliveryId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: () => receiveDelivery(deliveryId),
    onSuccess: () => refresh(deliveryId),
  });
};

export const useUploadDeliveryBill = (shopId: string, deliveryId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: (file: BillFile) => uploadDeliveryBill(deliveryId, file),
    onSuccess: () => refresh(deliveryId),
  });
};

export const useRecordPayment = (shopId: string, deliveryId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: (input: RecordPaymentInput) => recordPayment(deliveryId, input),
    meta: { silent: true },
    onSuccess: () => refresh(deliveryId),
  });
};

export const useVoidPayment = (shopId: string, deliveryId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: ({
      paymentId,
      reason,
    }: {
      paymentId: string;
      reason: string;
    }) => voidPayment(paymentId, reason),
    onSuccess: () => refresh(deliveryId),
  });
};

export const useVoidDelivery = (shopId: string, deliveryId: string) => {
  const refresh = useRefreshDeliveries(shopId);
  return useMutation({
    mutationFn: (reason: string) => voidDelivery(deliveryId, reason),
    onSuccess: () => refresh(deliveryId),
  });
};

export const useSaveSupplier = (shopId: string, id?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) =>
      id ? updateSupplier(id, input) : createSupplier(shopId, input),
    meta: { silent: true },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: deliveryKeys.suppliers(shopId) }),
  });
};

export const useSaveCategory = (shopId: string, id?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      id ? updateCategory(id, input) : createCategory(shopId, input),
    meta: { silent: true },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: deliveryKeys.categories(shopId) }),
  });
};
