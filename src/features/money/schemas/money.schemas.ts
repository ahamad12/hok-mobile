import { z } from 'zod';

import {
  dateField,
  moneyField,
  moneyOrZeroField,
  optionalMoneyField,
  optionalText,
} from '@/utils/formSchemas';

// Mirrors tapt-api till-entry, daily-summary and expense contracts.

export const tillEntrySchema = z.object({
  category: z.enum(['SALES', 'EXPENSE', 'WITHDRAWAL', 'DEPOSIT']),
  amount: moneyField(),
  description: optionalText(500, 'Note'),
});
export type TillEntryFormValues = z.infer<typeof tillEntrySchema>;

export const closeDaySchema = z.object({
  closingBalance: moneyOrZeroField('Counted cash'),
  /** Blank = the server uses the previous day's closing balance. */
  openingBalance: optionalMoneyField(),
  notes: optionalText(1000, 'Notes'),
});
export type CloseDayFormValues = z.infer<typeof closeDaySchema>;

export const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category'),
  amount: moneyField(),
  description: z
    .string()
    .trim()
    .min(1, 'Say what it was for')
    .max(2000, 'Too long'),
  expenseDate: dateField('Date'),
});
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
