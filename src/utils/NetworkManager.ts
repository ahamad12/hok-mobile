import { debounce } from 'lodash';

import { NetworkStatus } from '@/constants/AppConstants';
import { useStore } from '@/store';

// Get the store instance outside of the debounce
const store = useStore;

// Create a debounced function to update network status.
// 1s trailing debounce: collapses NetInfo flaps without delaying the offline
// banner (the previous config paired a 3s wait with maxWait: 1000, which is
// contradictory — lodash clamps to maxWait, so the 3s never took effect).
const debouncedSetNetworkStatus = debounce(
  (status: NetworkStatus) => {
    store.getState().setNetworkStatus(status);
  },
  1000,
  {
    leading: false,
    trailing: true,
  },
);

// Export the debounced handler
export const debouncedNoInternetHandler = (status: NetworkStatus) => {
  debouncedSetNetworkStatus(status);
};

// For backward compatibility
export const initializeNetworkManager = () => {
  // Return a function that updates the network status
  return (status: NetworkStatus) => {
    store.getState().setNetworkStatus(status);
  };
};
