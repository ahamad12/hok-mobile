import { ApiResponse, unwrap } from '@/constants/ApiResponse';

import { authedClient } from './httpClient';

// Thin typed wrappers over authedClient + unwrap so each feature's *.api.ts
// reads as a list of endpoints. Query params skip undefined values.

type Params = Record<string, string | number | boolean | undefined | null>;

const clean = (params?: Params) =>
  params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== null && v !== '',
        ),
      )
    : undefined;

export async function apiGet<T>(url: string, params?: Params): Promise<T> {
  return unwrap(
    await authedClient.get<ApiResponse<T>>(url, { params: clean(params) }),
  );
}

export async function apiPost<T>(url: string, body: object = {}): Promise<T> {
  return unwrap(await authedClient.post<ApiResponse<T>>(url, body));
}

export async function apiPatch<T>(url: string, body: object): Promise<T> {
  return unwrap(await authedClient.patch<ApiResponse<T>>(url, body));
}

/** v4 UUID for idempotency keys (ticket clientMessageId). */
export function uuidv4(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
