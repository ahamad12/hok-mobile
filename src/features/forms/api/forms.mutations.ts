import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createForm, submitForm, updateForm } from './forms.api';
import { CreateFormInput, FormAnswers, UpdateFormInput } from './forms.types';
import { formKeys } from './query-keys';

export const useCreateForm = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateFormInput, 'shopId'>) =>
      createForm({ ...input, shopId }),
    meta: { silent: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.shop(shopId) }),
  });
};

export const useUpdateForm = (shopId: string, id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateFormInput) => updateForm(id, input),
    onSuccess: (form) => {
      qc.setQueryData(formKeys.detail(id), form);
      return qc.invalidateQueries({ queryKey: formKeys.shop(shopId) });
    },
  });
};

export const useSubmitForm = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: FormAnswers) => submitForm(id, answers),
    // The fill screen maps 422 field errors inline.
    meta: { silent: true },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: formKeys.submissions(id) }),
  });
};
