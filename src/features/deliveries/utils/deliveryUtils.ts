import { BadgeTone } from '@/components/Badge';
import { parseMoneyToCents } from '@/utils/money';

import { PaymentMode, PaymentStatus } from '../api/deliveries.types';

export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; tone: BadgeTone }
> = {
  UNPAID: { label: 'Unpaid', tone: 'error' },
  PARTIAL: { label: 'Part paid', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'success' },
};

export const PAYMENT_MODE: Record<PaymentMode, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank transfer',
};

/**
 * What a line will cost: received quantity × unit price, matching how the
 * server totals a delivery. Null until both are valid.
 */
export function lineTotalCents(
  quantityReceived: string,
  unitPrice: string,
): number | null {
  const qty = Number(quantityReceived);
  const price = parseMoneyToCents(unitPrice);
  if (!quantityReceived || Number.isNaN(qty) || price === null) return null;
  return Math.round(qty * price);
}
