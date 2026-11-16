import { z } from 'zod';

import {
  dateField,
  optionalDateField,
  optionalMoneyField,
  optionalText,
} from '@/utils/formSchemas';

// Mirrors tapt-api license.contract.ts.

const renewalFields = {
  issueDate: dateField('Issue date'),
  expiryDate: dateField('Expiry date'),
  paymentAmount: optionalMoneyField(),
  paymentDate: optionalDateField('Payment date'),
  notes: optionalText(500, 'Notes'),
};

const expiryAfterIssue = <T extends { issueDate: string; expiryDate: string }>(
  v: T,
) => v.expiryDate > v.issueDate;

export const renewalSchema = z
  .object(renewalFields)
  .refine(expiryAfterIssue, {
    message: 'Expiry must be after the issue date',
    path: ['expiryDate'],
  });
export type RenewalFormValues = z.infer<typeof renewalSchema>;

export const licenseSchema = z
  .object({
    productName: z
      .string()
      .trim()
      .min(1, 'What is this licence for?')
      .max(200, 'Too long'),
    licenseNumber: z
      .string()
      .trim()
      .min(1, 'Licence number is required')
      .max(100, 'Too long'),
    remindDays: z
      .string()
      .trim()
      .refine((v) => v === '' || /^\d+$/.test(v), 'Whole days, e.g. 30'),
    ...renewalFields,
  })
  .refine(expiryAfterIssue, {
    message: 'Expiry must be after the issue date',
    path: ['expiryDate'],
  });
export type LicenseFormValues = z.infer<typeof licenseSchema>;
