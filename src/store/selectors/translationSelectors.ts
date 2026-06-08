import { useStore } from '@/store';

export const useLocale = () => useStore((state) => state.locale);
export const useSetLocale = () => useStore((state) => state.setLocale);
export const useTranslate = () => useStore((state) => state.t);
