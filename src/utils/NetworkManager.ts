import { debounce } from 'lodash';

import { NetworkStatus } from '@/constants/AppConstants';
import { useStore } from '@/store';

// Get the store instance outside of the debounce
const store = useStore;

// Create a debounced function to update network status
const debouncedSetNetworkStatus = debounce(
  (status: NetworkStatus) => {
    store.getState().setNetworkStatus(status);
  },
  // Debounce for 3 seconds
  3000,
  {
    leading: false,
    trailing: true,
    maxWait: 1000,
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
