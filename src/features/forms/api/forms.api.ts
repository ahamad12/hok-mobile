import { ENDPOINTS } from '@/constants/Endpoints';
import { apiGet, apiPatch, apiPost } from '@/services/apiRequest';

import {
  CreateFormInput,
  Form,
  FormAnswers,
  FormSubmission,
  UpdateFormInput,
} from './forms.types';

const F = ENDPOINTS.FORMS;

export async function getForms(shopId: string): Promise<Form[]> {
  return (await apiGet<{ forms: Form[] }>(F.LIST, { shopId })).forms;
}

export const getForm = (id: string) => apiGet<Form>(F.BY_ID(id));

/** OWNER/MANAGER. */
export const createForm = (input: CreateFormInput) =>
  apiPost<Form>(F.CREATE, input);

/** OWNER/MANAGER. */
export const updateForm = (id: string, input: UpdateFormInput) =>
  apiPatch<Form>(F.UPDATE(id), input);

/** Server validates answers per field; failures come back as 422. */
export const submitForm = (id: string, answers: FormAnswers) =>
  apiPost<FormSubmission>(F.SUBMIT(id), { answers });

export const getSubmissions = (id: string) =>
  apiGet<{ submissions: FormSubmission[]; total: number }>(F.SUBMISSIONS(id), {
    limit: 50,
  });
