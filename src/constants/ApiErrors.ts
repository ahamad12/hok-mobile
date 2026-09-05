import { AxiosError } from 'axios';

import { ToastOptions } from '@/store/slices/toastSlice';

// Matches tapt-api: global-exception.filter.ts ErrorResponseBody
export interface ApiErrorData {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp?: string;
  path?: string;
}

export type ServerErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE_VIOLATION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'ALREADY_EXISTS'
  | 'DATABASE_INIT_ERROR'
  | 'DATABASE_PANIC'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST';

export type ClientErrorCode = 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

export type ApiErrorCode = ServerErrorCode | ClientErrorCode;

// Back-compat alias — prefer ServerErrorCode
/** @deprecated use ServerErrorCode */
export type BackendErrorCode = ServerErrorCode;

function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

export const getErrorCode = (error: unknown): ApiErrorCode => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;
    if (data?.error?.code) return data.error.code as ApiErrorCode;
    if (
      error.code === 'ERR_CANCELED' ||
      error.code === 'ERR_NETWORK' ||
      !error.response
    ) {
      return 'NETWORK_ERROR';
    }
  }
  return 'UNKNOWN_ERROR';
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;
    if (data?.error?.message) return data.error.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const getApiErrorDetails = (
  error: unknown,
): { code: ApiErrorCode; message: string; details?: unknown } => {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);
  let details: unknown;
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;
    details = data?.error?.details;
  }
  return { code, message, details };
};

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_INPUT: 'Please check your input and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to do that.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Requested resource was not found.',
  CONFLICT: 'This already exists.',
  BUSINESS_RULE_VIOLATION: 'This action is not allowed.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again.',
  EXTERNAL_SERVICE_ERROR: 'External service unavailable. Please try again.',
  ALREADY_EXISTS: 'This already exists.',
  DATABASE_INIT_ERROR: 'Database unavailable. Please try again.',
  DATABASE_PANIC: 'Database error. Please try again.',
  DATABASE_ERROR: 'Database error. Please try again.',
  BAD_REQUEST: 'Bad request. Please check your input.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export const getErrorDisplayMessage = (code: ApiErrorCode): string => {
  return ERROR_MESSAGES[code] ?? 'An unexpected error occurred.';
};

// Codes where the backend's own message is more specific/useful than our
// generic mapping — e.g. "Email already registered" beats "This already exists."
const SERVER_MESSAGE_WINS: ReadonlySet<ApiErrorCode> = new Set([
  'VALIDATION_ERROR',
  'INVALID_INPUT',
  'CONFLICT',
  'ALREADY_EXISTS',
  'BUSINESS_RULE_VIOLATION',
  'FORBIDDEN',
  'NOT_FOUND',
]);

export const toErrorToast = (error: unknown): ToastOptions => {
  const { code, message } = getApiErrorDetails(error);
  const useServerMessage = SERVER_MESSAGE_WINS.has(code) && Boolean(message);

  return {
    variant: 'error',
    message: useServerMessage ? message : getErrorDisplayMessage(code),
  };
};