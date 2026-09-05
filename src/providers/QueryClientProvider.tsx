import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider as BaseQueryClientProvider,
} from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

import { captureError } from '@/config/SentrySetup';
import { toErrorToast } from '@/constants/ApiErrors';
import { useStore } from '@/store';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // Background/query errors: report only. Screens own their error/empty
      // states + retry — no toast spam from stale-pass refetches.
      captureError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Mutations are user-initiated — a toast is expected feedback.
      useStore.getState().showToast(toErrorToast(error));
      captureError(error);
    },
  }),
});

export const QueryClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <BaseQueryClientProvider client={queryClient}>
      {children}
    </BaseQueryClientProvider>
  );
};