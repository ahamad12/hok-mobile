// Mirrors tapt-api contracts: delivery, supplier and category.

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
/** PENDING: lines still editable, not payable. RECEIVED: checked in. */
export type DeliveryStatus = 'PENDING' | 'RECEIVED';

export type Delivery = {
  id: string;
  shopId: string;
  supplierId: string;
  billUrl: string | null;
  totalAmountCents: number;
  totalPaidCents: number;
  balanceDueCents: number;
  paymentStatus: PaymentStatus;
  status: DeliveryStatus;
  receivedAt: string | null;
  receivedById: string | null;
  deliveredById: string;
  deliveredAt: string;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryLineItem = {
  id: string;
  deliveryId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  unitPriceCents: number;
  lineTotalCents: number;
  discrepancyNote: string | null;
  hasDiscrepancy: boolean;
  createdAt: string;
};

export type DeliveryPayment = {
  id: string;
  deliveryId: string;
  amountCents: number;
  paymentMode: PaymentMode;
  paidAt: string;
  recordedById: string;
  notes: string | null;
  voidedAt: string | null;
  voidedById: string | null;
  voidReason: string | null;
  createdAt: string;
};

export type DeliveryDetail = {
  delivery: Delivery;
  lineItems: DeliveryLineItem[];
  payments: DeliveryPayment[];
};

export type LineItemInput = {
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  unitPriceCents: number;
  discrepancyNote?: string;
};

export type CreateDeliveryInput = {
  shopId: string;
  supplierId: string;
  deliveredAt?: string;
  lineItems: LineItemInput[];
  /** Check in at once instead of starting PENDING. */
  receiveNow?: boolean;
};

/** Only while PENDING and unpaid. lineItems replaces every line. */
export type UpdateDeliveryInput = {
  supplierId?: string;
  lineItems?: LineItemInput[];
};

/** A picked photo or file, as React Native's FormData expects it. */
export type BillFile = { uri: string; name: string; type: string };

export type RecordPaymentInput = {
  amountCents: number;
  paymentMode: PaymentMode;
  notes?: string;
};

export type DeliveryFilters = {
  supplierId?: string;
  paymentStatus?: PaymentStatus;
  status?: DeliveryStatus;
};

export type SupplierOutstanding = {
  supplierId: string;
  totalAmountCents: number;
  totalPaidCents: number;
  outstandingCents: number;
};

export type Supplier = {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SupplierInput = {
  categoryId: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean;
};

export type Category = {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};
