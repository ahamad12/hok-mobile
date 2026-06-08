import { StateCreator } from 'zustand';

import { COLOR_THEME, NetworkStatus } from '@/constants';

export type AppSlice = {
  // App state
  isLoading: boolean;
  selectedTheme: COLOR_THEME;
  networkStatus: NetworkStatus;
  // Actions
  setLoading: (isLoading: boolean) => void;
  setNetworkStatus: (networkStatus: NetworkStatus) => void;
  setColorTheme: (theme: COLOR_THEME) => void;
  resetApp: () => void;
};

// Type for the store's state creator
type AppStateCreator = StateCreator<AppSlice>;

export const createAppSlice: AppStateCreator = (set, _get) => ({
  // Initial state
  isLoading: false,
  selectedTheme: COLOR_THEME.SYSTEM_DEFAULT,
  networkStatus: NetworkStatus.ONLINE,
  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setNetworkStatus: (networkStatus: NetworkStatus) => set({ networkStatus }),
  setColorTheme: (selectedTheme) => set({ selectedTheme }),
  resetApp: () =>
    set({
      isLoading: false,
      selectedTheme: COLOR_THEME.SYSTEM_DEFAULT,
      networkStatus: NetworkStatus.ONLINE,
    }),
});
