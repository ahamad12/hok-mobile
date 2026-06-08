import { addEventListener, fetch } from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { NetworkStatus } from '@/constants/AppConstants';
import { useSetNetworkStatus } from '@/store/selectors/appSelectors';

export const useNetworkStatus = (): void => {
  const setNetworkStatus = useSetNetworkStatus();

  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      const status = state.isConnected
        ? NetworkStatus.ONLINE
        : NetworkStatus.OFFLINE;

      setNetworkStatus(status);
    });

    // Initial check
    fetch().then((state) => {
      const status = state.isConnected
        ? NetworkStatus.ONLINE
        : NetworkStatus.OFFLINE;
      setNetworkStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, [setNetworkStatus]);
};
