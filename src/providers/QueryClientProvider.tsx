import { QueryClientProvider as BaseQueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

import { queryClient } from './queryClient';

export const QueryClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <BaseQueryClientProvider client={queryClient}>
      {children}
    </BaseQueryClientProvider>
  );
};
