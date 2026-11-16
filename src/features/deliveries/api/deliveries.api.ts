import { ENDPOINTS } from '@/constants/Endpoints';
import {
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
} from '@/services/apiRequest';

import {
  BillFile,
  Category,
  CategoryInput,
  CreateDeliveryInput,
  Delivery,
  DeliveryDetail,
  DeliveryFilters,
  DeliveryPayment,
  RecordPaymentInput,
  Supplier,
  SupplierInput,
  SupplierOutstanding,
  UpdateDeliveryInput,
} from './deliveries.types';

const D = ENDPOINTS.DELIVERIES;

// ── Deliveries ───────────────────────────────────────────────────────────

export const getDeliveries = (shopId: string, filters: DeliveryFilters = {}) =>
  apiGet<{ deliveries: Delivery[]; total: number }>(D.LIST, {
    shopId,
    limit: 100,
    ...filters,
  });

export const getDelivery = (id: string) => apiGet<DeliveryDetail>(D.BY_ID(id));

export const createDelivery = (input: CreateDeliveryInput) =>
  apiPost<Delivery>(D.CREATE, input);

/** Anyone in the shop, while PENDING and unpaid. */
export const updateDelivery = (id: string, input: UpdateDeliveryInput) =>
  apiPatch<Delivery>(D.BY_ID(id), input);

/** Check in: PENDING -> RECEIVED. Locks the lines; makes it payable. */
export const receiveDelivery = (id: string) =>
  apiPost<Delivery>(D.RECEIVE(id));

/** Invoice photo or PDF (multipart "file"). Replaces billUrl. */
export const uploadDeliveryBill = (id: string, file: BillFile) =>
  apiUpload<Delivery>(D.BILL(id), file);

/** OWNER/MANAGER. Guarded server-side against overpaying. */
export const recordPayment = (id: string, input: RecordPaymentInput) =>
  apiPost<{ delivery: Delivery; payment: DeliveryPayment }>(
    D.RECORD_PAYMENT(id),
    input,
  );

/** OWNER/MANAGER. */
export const voidPayment = (paymentId: string, voidReason: string) =>
  apiPost<{ delivery: Delivery; payment: DeliveryPayment }>(
    D.VOID_PAYMENT(paymentId),
    { voidReason },
  );

/** OWNER/MANAGER. */
export const voidDelivery = (id: string, voidReason: string) =>
  apiPost<Delivery>(D.VOID(id), { voidReason });

export async function getSupplierOutstanding(
  shopId: string,
): Promise<SupplierOutstanding[]> {
  return (
    await apiGet<{ balances: SupplierOutstanding[] }>(D.SUPPLIER_OUTSTANDING, {
      shopId,
    })
  ).balances;
}

// ── Suppliers ────────────────────────────────────────────────────────────

export async function getSuppliers(shopId: string): Promise<Supplier[]> {
  return (
    await apiGet<{ suppliers: Supplier[] }>(ENDPOINTS.SUPPLIERS.LIST, {
      shopId,
    })
  ).suppliers;
}

/** OWNER/MANAGER. */
export const createSupplier = (shopId: string, input: SupplierInput) =>
  apiPost<Supplier>(ENDPOINTS.SUPPLIERS.CREATE, {
    shopId,
    categoryId: input.categoryId,
    name: input.name,
    phone: input.phone || undefined,
    address: input.address || undefined,
  });

/** OWNER/MANAGER. */
export const updateSupplier = (id: string, input: Partial<SupplierInput>) =>
  apiPatch<Supplier>(ENDPOINTS.SUPPLIERS.UPDATE(id), input);

// ── Supplier categories ──────────────────────────────────────────────────

export async function getCategories(shopId: string): Promise<Category[]> {
  return (
    await apiGet<{ categories: Category[] }>(ENDPOINTS.CATEGORIES.LIST, {
      shopId,
    })
  ).categories;
}

/** OWNER/MANAGER. */
export const createCategory = (shopId: string, input: CategoryInput) =>
  apiPost<Category>(ENDPOINTS.CATEGORIES.CREATE, {
    shopId,
    name: input.name,
    description: input.description || undefined,
  });

/** OWNER/MANAGER. */
export const updateCategory = (id: string, input: Partial<CategoryInput>) =>
  apiPatch<Category>(ENDPOINTS.CATEGORIES.UPDATE(id), input);
