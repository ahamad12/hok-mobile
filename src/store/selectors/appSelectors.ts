import { useShallow } from 'zustand/react/shallow';

import { COLOR_THEME } from '@/constants';
import { NetworkStatus } from '@/constants/AppConstants';
import { useStore } from '@/store';
import { StoreState } from '@/store/types';

// Type for the selector function
type Selector<T> = (state: StoreState) => T;

// Hook for accessing specific app state properties and actions
export const useAppState = <T>(selector: Selector<T>): T => {
  return useStore(useShallow(selector));
};

// Individual Selector functions
const selectIsLoading = (state: StoreState) => state.isLoading;
const selectNetworkStatus = (state: StoreState) => state.networkStatus;
const selectSelectedTheme = (state: StoreState) => state.selectedTheme;
const selectIsOnline = (state: StoreState) =>
  state.networkStatus === NetworkStatus.ONLINE;
const selectIsDarkMode = (state: StoreState) =>
  state.selectedTheme === COLOR_THEME.DARK;
const selectSetLoading = (state: StoreState) => state.setLoading;
const selectSetNetworkStatus = (state: StoreState) => state.setNetworkStatus;
const selectSetColorTheme = (state: StoreState) => state.setColorTheme;
const selectResetApp = (state: StoreState) => state.resetApp;

// Hook for the full state
export const useFullAppState = () => {
  return useAppState(
    useShallow((state) => ({
      isLoading: state.isLoading,
      networkStatus: state.networkStatus,
      selectedTheme: state.selectedTheme,
      isOnline: state.networkStatus === NetworkStatus.ONLINE,
      isDarkMode: state.selectedTheme === COLOR_THEME.DARK,
      setLoading: state.setLoading,
      setNetworkStatus: state.setNetworkStatus,
      setColorTheme: state.setColorTheme,
      resetApp: state.resetApp,
    })),
  );
};

// Individual selectors for convenience
export const useLoading = () => useAppState(selectIsLoading);
export const useNetworkStatus = () => useAppState(selectNetworkStatus);
export const useSelectedTheme = () => useAppState(selectSelectedTheme);
export const useIsOnline = () => useAppState(selectIsOnline);
export const useIsDarkMode = () => useAppState(selectIsDarkMode);

// Individual action selectors for convenience
export const useSetLoading = () => useAppState(selectSetLoading);
export const useSetNetworkStatus = () => useAppState(selectSetNetworkStatus);
export const useSetColorTheme = () => useAppState(selectSetColorTheme);
export const useResetApp = () => useAppState(selectResetApp);

// Export all selectors for testing and advanced usage
export const appSelectors = {
  selectIsLoading,
  selectNetworkStatus,
  selectSelectedTheme,
  selectIsOnline,
  selectIsDarkMode,
  selectSetLoading,
  selectSetNetworkStatus,
  selectSetColorTheme,
  selectResetApp,
};
