import { z } from 'zod';

import { optionalDateField, optionalText } from '@/utils/formSchemas';

// Mirrors tapt-api task.contract.ts and ticket.contract.ts body schemas.

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title is too short')
    .max(200, 'Title is too long'),
  description: optionalText(2000, 'Description'),
  dueDate: optionalDateField('Due date'),
  priority: z.enum(['0', '5', '10']),
  assigneeId: z.string(),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']),
});
export type TaskFormValues = z.infer<typeof taskSchema>;

export const PRIORITY_OPTIONS = [
  { value: '0' as const, label: 'Normal' },
  { value: '5' as const, label: 'High' },
  { value: '10' as const, label: 'Urgent' },
];

export const priorityLabel = (p: number) =>
  p >= 10 ? 'Urgent' : p >= 5 ? 'High' : 'Normal';

export const ticketSchema = z.object({
  type: z.enum(['ISSUE', 'INSTRUCTION', 'ANNOUNCEMENT']),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject is too short')
    .max(200, 'Subject is too long'),
  body: z
    .string()
    .trim()
    .min(1, 'Add a message')
    .max(5000, 'Message is too long'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  requiresAck: z.boolean(),
});
export type TicketFormValues = z.infer<typeof ticketSchema>;
