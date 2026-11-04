import { z } from 'zod';

import { getPasswordViolations } from '../utils/password';

// Login intentionally has no password-strength check — the backend itself
// only requires min(1) on login (strength is enforced on register /
// change-password, guide §7). Mirroring a strength rule here would reject
// valid existing passwords created before any rule ever changed.
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Public registration — owner-account fields only, never role/shopId. */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .superRefine((value, ctx) => {
      const violations = getPasswordViolations(value);
      for (const violation of violations) {
        ctx.addIssue({ code: 'custom', message: violation });
      }
    }),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name is too short')
    .max(100, 'Display name is too long'),
  username: z
    .string()
    .trim()
    .min(3, 'Username is too short')
    .max(30, 'Username is too long')
    .optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .superRefine((value, ctx) => {
        const violations = getPasswordViolations(value);
        for (const violation of violations) {
          ctx.addIssue({ code: 'custom', message: violation });
        }
      }),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name is too short')
    .max(100, 'Display name is too long')
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username is too short')
    .max(30, 'Username is too long')
    .nullish(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

const strongPassword = z
  .string()
  .min(1, 'Password is required')
  .superRefine((value, ctx) => {
    for (const violation of getPasswordViolations(value)) {
      ctx.addIssue({ code: 'custom', message: violation });
    }
  });

/** OWNER invites MANAGER/STAFF, MANAGER invites STAFF. Mirrors the API's rules. */
export const createInvitationSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    role: z.enum(['MANAGER', 'STAFF']),
    shopId: z.string().min(1).optional(),
    isSupervisor: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === 'MANAGER' && value.shopId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Managers manage the whole business and cannot be assigned to a shop.',
        path: ['shopId'],
      });
    }
    if (value.isSupervisor && value.role !== 'STAFF') {
      ctx.addIssue({
        code: 'custom',
        message: 'Only staff can be marked as a supervisor.',
        path: ['isSupervisor'],
      });
    }
    if (value.isSupervisor && !value.shopId) {
      ctx.addIssue({
        code: 'custom',
        message: 'A supervisor must be assigned to a shop.',
        path: ['shopId'],
      });
    }
  });

export type CreateInvitationFormValues = z.infer<typeof createInvitationSchema>;

/** Invitee completes their account from the email link. */
export const acceptInvitationSchema = z.object({
  password: strongPassword,
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name is too short')
    .max(100, 'Display name is too long'),
});

export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;
