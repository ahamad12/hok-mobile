import { z } from 'zod';

import { isBusinessDate } from './businessDate';
import { parseMoneyToCents } from './money';

// Field builders shared by every feature's *.schemas.ts. Form values stay
// strings (what TextInput gives); submit handlers convert with
// parseMoneyToCents / Number.

/** Amount typed as text, e.g. "12.50". Must be > 0. */
export const moneyField = (label = 'Amount') =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => parseMoneyToCents(v) !== null, 'Enter an amount like 12.50')
    .refine(
      (v) => (parseMoneyToCents(v) ?? 0) > 0,
      `${label} must be more than 0`,
    );

/** Optional amount; empty string allowed. */
export const optionalMoneyField = () =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === '' || parseMoneyToCents(v) !== null,
      'Enter an amount like 12.50',
    );

/** Amount that may be zero (e.g. counted cash). */
export const moneyOrZeroField = (label = 'Amount') =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => parseMoneyToCents(v) !== null, 'Enter an amount like 12.50');

export const dateField = (label = 'Date') =>
  z
    .string()
    .trim()
    .refine(isBusinessDate, `${label} must be a date like 2026-11-07`);

export const optionalDateField = (label = 'Date') =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === '' || isBusinessDate(v),
      `${label} must be a date like 2026-11-07`,
    );

export const positiveNumberField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (v) => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0,
      `${label} must be more than 0`,
    );

export const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} is too long`);

/** "" -> undefined, so the API never stores empty strings. */
export const blankToUndefined = (v: string | undefined) =>
  v && v.trim() ? v.trim() : undefined;
