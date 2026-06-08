import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';

import { getExample } from './example.api';

export const useGetExample = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXAMPLE_DETAIL, id],
    queryFn: () => getExample(id),
    enabled: !!id,
  });
};

export const useListExamples = (filters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXAMPLE_LIST, filters],
    queryFn: () => getExample('1'), // Replace with actual list endpoint
  });
};
