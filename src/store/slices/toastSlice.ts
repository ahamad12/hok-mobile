import { ReactNode } from 'react';
import { StateCreator } from 'zustand';

import { IconName } from '@/components/AppIcon';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastOptions = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: IconName | ReactNode;
};

export type ToastItem = ToastOptions & { id: number; variant: ToastVariant };

export type ToastSlice = {
  toast: ToastItem | null;
  /** Toasts waiting to be shown once the current one is dismissed. FIFO. */
  queue: ToastItem[];
  showToast: (options: ToastOptions) => void;
  /**
   * Dismiss the current toast. If a toast is queued, it becomes the new
   * current toast — callers don't need to know a queue exists.
   */
  hideToast: () => void;
};

type ToastStateCreator = StateCreator<ToastSlice>;

// Monotonic counter instead of Date.now(): two showToast() calls in the
// same millisecond (e.g. an error boundary + a network toast firing back
// to back) previously produced the same id, so the AppToast effect keyed
// on toast?.id wouldn't re-trigger and the second toast silently vanished.
let idCounter = 0;

export const createToastSlice: ToastStateCreator = (set) => ({
  toast: null,
  queue: [],

  showToast: (options) =>
    set((state) => {
      const nextToast: ToastItem = {
        ...options,
        variant: options.variant ?? 'info',
        id: ++idCounter,
      };

      // Nothing showing — display immediately.
      if (!state.toast) {
        return { toast: nextToast, queue: state.queue };
      }

      // A loading toast is a placeholder for an in-flight operation's
      // result — the natural next call (success/error) should replace it
      // immediately rather than wait in line behind it, since a loading
      // toast never auto-dismisses on its own (duration is forced to 0).
      if (state.toast.variant === 'loading') {
        return { toast: nextToast, queue: state.queue };
      }

      // Otherwise queue it. Previously this branch didn't exist and the
      // second showToast() call would just overwrite `toast` outright,
      // silently dropping whatever was currently showing.
      return { queue: [...state.queue, nextToast] };
    }),

  hideToast: () =>
    set((state) => {
      const [next, ...rest] = state.queue;
      return { toast: next ?? null, queue: rest };
    }),
});
