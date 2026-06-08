import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/constants';

import {
  createExample,
  deleteExample,
  ExampleData,
  updateExample,
} from './example.api';

type CreateExampleInput = Omit<ExampleData, 'id'>;
type UpdateExampleInput = Partial<Omit<ExampleData, 'id'>>;

export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation<ExampleData, Error, CreateExampleInput>({
    mutationFn: createExample,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXAMPLE_LIST],
      });
    },
  });
};

export const useUpdateExample = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ExampleData,
    Error,
    { id: string; data: UpdateExampleInput }
  >({
    mutationFn: ({ id, data }) => updateExample(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXAMPLE_DETAIL, data.id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXAMPLE_LIST],
      });
    },
  });
};

export const useDeleteExample = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteExample,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXAMPLE_LIST],
      });
    },
  });
};
