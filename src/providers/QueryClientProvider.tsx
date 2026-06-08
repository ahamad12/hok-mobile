import {
  QueryClient,
  QueryClientProvider as BaseQueryClientProvider,
} from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export const QueryClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <BaseQueryClientProvider client={queryClient}>
      {children}
    </BaseQueryClientProvider>
  );
};
