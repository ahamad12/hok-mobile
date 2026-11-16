import { addEventListener as onNetInfo } from '@react-native-community/netinfo';
import {
  focusManager,
  MutationCache,
  onlineManager,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import { AppState } from 'react-native';

import { captureError } from '@/config/SentrySetup';
import { toErrorToast } from '@/constants/ApiErrors';
import { useStore } from '@/store';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      captureError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Mutations are user-initiated — a toast is expected feedback, unless
      // the screen renders the error inline (meta.silent, typed via the
      // Register augmentation in src/types/react-query.d.ts).
      if (!mutation?.meta?.silent) {
        useStore.getState().showToast(toErrorToast(error));
      }
      captureError(error);
    },
  }),
});

// React Native has no window focus: refetch stale queries when the app
// comes back to the foreground, and pause/resume with the network.
focusManager.setEventListener((setFocused) => {
  const sub = AppState.addEventListener('change', (s) =>
    setFocused(s === 'active'),
  );
  return () => sub.remove();
});
onlineManager.setEventListener((setOnline) =>
  onNetInfo((state) => setOnline(!!state.isConnected)),
);
