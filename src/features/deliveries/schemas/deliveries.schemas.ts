import { z } from 'zod';

import {
  moneyField,
  optionalText,
  positiveNumberField,
} from '@/utils/formSchemas';

// Mirrors tapt-api delivery, supplier and category contracts.

export const lineItemSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(1, 'Product is required')
    .max(200, 'Too long'),
  quantityOrdered: positiveNumberField('Ordered'),
  quantityReceived: z
    .string()
    .trim()
    .min(1, 'Received is required')
    .refine((v) => /^\d+(\.\d+)?$/.test(v), 'Enter a number'),
  unit: z.string().trim().min(1, 'Unit is required').max(50, 'Too long'),
  unitPrice: moneyField('Unit price'),
  discrepancyNote: optionalText(500, 'Note'),
});

export const deliverySchema = z.object({
  supplierId: z.string().min(1, 'Choose a supplier'),
  lineItems: z.array(lineItemSchema).min(1, 'Add at least one item'),
});
export type DeliveryFormValues = z.infer<typeof deliverySchema>;

export const emptyLineItem = {
  productName: '',
  quantityOrdered: '',
  quantityReceived: '',
  unit: 'pcs',
  unitPrice: '',
  discrepancyNote: '',
};

export const paymentSchema = z.object({
  amount: moneyField(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
  notes: optionalText(500, 'Note'),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const supplierSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Too long'),
  categoryId: z.string().min(1, 'Choose a category'),
  phone: optionalText(20, 'Phone'),
  address: optionalText(500, 'Address'),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Too long'),
  description: optionalText(500, 'Description'),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;
