import { AxiosError, AxiosResponse } from 'axios';

import { ApiErrorData } from './ApiErrors';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorData;

/**
 * Per-resource paginated list shape, e.g. Paginated<'shops', Shop> ->
 * { shops: Shop[]; total: number }. Matches shop.contract.ts:69,
 * delivery.contract.ts:99, task.contract.ts:88, etc. — the key is the
 * resource name, never forced to a generic `items`.
 */
export type Paginated<K extends string, T> = Record<K, T[]> & { total: number };

export function isApiSuccess<T>(body: ApiResponse<T> | unknown): body is ApiSuccess<T> {
  return (body as ApiResponse<T>)?.success === true;
}

export function isApiError<T>(body: ApiResponse<T> | unknown): body is ApiErrorData {
  return (body as ApiResponse<T>)?.success === false;
}

/**
 * Unwraps a 2xx ApiResponse<T> into T.
 * Defensive case: if an endpoint ever returns HTTP 2xx with a body shaped
 * like `{ success: false, ... }` (bypassing the backend's normal error path),
 * synthesize a real AxiosError from it — response.data already IS a valid
 * ApiErrorData here, so error.response.data matches exactly what
 * getErrorCode/getApiErrorDetails expect. This makes toErrorToast behave
 * identically to a genuine 4xx/5xx instead of silently returning `undefined`.
 */
export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const body = response.data;

  if (isApiError(body)) {
    throw new AxiosError(
      body.error.message,
      body.error.code,
      response.config,
      response.request,
      response,
    );
  }

  return (body as ApiSuccess<T>).data;
}

/** Same as unwrap, but for the { <resourceKey>: T[]; total } list shape. */
export function unwrapPaginated<K extends string, T>(
  response: AxiosResponse<ApiResponse<Paginated<K, T>>>,
  key: K,
): { items: T[]; total: number } {
  const paginated = unwrap(response);
  // eslint-disable-next-line security/detect-object-injection -- key is a caller-supplied literal resource name (e.g. 'shops'), not user input
  return { items: paginated[key], total: paginated.total };
}
