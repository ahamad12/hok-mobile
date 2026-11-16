import { z } from 'zod';

import { moneyField, positiveNumberField } from '@/utils/formSchemas';

// Mirrors tapt-api scratch.contract.ts body schemas.

const serial = z
  .string()
  .trim()
  .regex(/^\d{3}$/, 'Serial is exactly 3 digits, e.g. 007');

export const recordScanSchema = z.object({
  shiftPeriod: z.enum(['MORNING', 'EVENING']),
  scannedSerial: serial,
});
export type RecordScanFormValues = z.infer<typeof recordScanSchema>;

export const receivePackSchema = z.object({
  gameId: z.string().min(1, 'Choose a game'),
  serialStart: serial,
  location: z.enum(['DISPLAY', 'BACKSTOCK']),
});
export type ReceivePackFormValues = z.infer<typeof receivePackSchema>;

export const createGameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name is too long'),
  gameNumber: z.string().trim().max(50, 'Game number is too long'),
  price: moneyField('Ticket price'),
  ticketsPerPack: positiveNumberField('Tickets per pack').refine(
    (v) => Number.isInteger(Number(v)),
    'Tickets per pack is a whole number',
  ),
});
export type CreateGameFormValues = z.infer<typeof createGameSchema>;
