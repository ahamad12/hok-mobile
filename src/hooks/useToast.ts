import { ReactNode } from 'react';

import { IconName } from '@/components/AppIcon';
import { useHideToast, useShowToast } from '@/store/selectors/toastSelectors';
import { ToastOptions } from '@/store/slices/toastSlice';

export const useToast = () => {
  const showToast = useShowToast();
  const hideToast = useHideToast();

  return {
    showToast: (options: ToastOptions) => showToast(options),
    hideToast,
    success: (
      message: string,
      title?: string,
      icon?: IconName | ReactNode,
      duration?: number,
    ) =>
      showToast({
        message,
        title,
        variant: 'success',
        icon,
        duration: duration ?? 3500,
      }),
    error: (
      message: string,
      title?: string,
      icon?: IconName | ReactNode,
      duration?: number,
    ) =>
      showToast({
        message,
        title,
        variant: 'error',
        icon,
        duration: duration ?? 5000,
      }),
    warning: (
      message: string,
      title?: string,
      icon?: IconName | ReactNode,
      duration?: number,
    ) =>
      showToast({
        message,
        title,
        variant: 'warning',
        icon,
        duration: duration ?? 5000,
      }),
    info: (
      message: string,
      title?: string,
      icon?: IconName | ReactNode,
      duration?: number,
    ) =>
      showToast({
        message,
        title,
        variant: 'info',
        icon,
        duration: duration ?? 3500,
      }),
    loading: (message: string, title?: string, icon?: IconName | ReactNode) =>
      showToast({ message, title, variant: 'loading', icon }),
  };
};