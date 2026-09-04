import { useStore } from '@/store';

export const useToastState = () => useStore((s) => s.toast);
export const useHideToast = () => useStore((s) => s.hideToast);
export const useShowToast = () => useStore((s) => s.showToast);
