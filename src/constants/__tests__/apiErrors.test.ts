import { AxiosError } from 'axios';

import {
  getApiErrorDetails,
  getErrorCode,
  getErrorDisplayMessage,
  toErrorToast,
} from '../ApiErrors';

const config = { headers: {} } as never;

function axiosErrorWithCode(code: string, message: string): AxiosError {
  return new AxiosError(
    message,
    code,
    config,
    {},
    {
      data: {
        success: false,
        error: { code, message },
      },
      config,
    } as never,
  );
}

describe('getErrorCode', () => {
  it('extracts the UNAUTHORIZED session code from the envelope', () => {
    expect(
      getErrorCode(axiosErrorWithCode('UNAUTHORIZED', 'Expired')),
    ).toBe('UNAUTHORIZED');
  });

  it('maps SessionExpiredError by name without importing the session class', () => {
    const error = new Error('Your session has ended. Please sign in again.');
    error.name = 'SessionExpiredError';
    expect(getErrorCode(error)).toBe('SESSION_EXPIRED');
  });

  it('does not mistake an ordinary Error for a session expiry', () => {
    expect(getErrorCode(new Error('boom'))).toBe('UNKNOWN_ERROR');
  });

  it('returns NETWORK_ERROR when the request never got a response', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', config);
    expect(getErrorCode(error)).toBe('NETWORK_ERROR');
  });

  it('returns UNKNOWN_ERROR for non-Axios, non-session input', () => {
    expect(getErrorCode(null)).toBe('UNKNOWN_ERROR');
  });
});

describe('getErrorDisplayMessage', () => {
  it('covers the new session codes with the sign-in-again copy', () => {
    expect(getErrorDisplayMessage('UNAUTHORIZED')).toBe(
      'Your session has ended. Please sign in again.',
    );
    expect(getErrorDisplayMessage('SESSION_EXPIRED')).toBe(
      'Your session has ended. Please sign in again.',
    );
  });
});

describe('getApiErrorDetails / toErrorToast', () => {
  it('returns code, message and details from the envelope', () => {
    const details = getApiErrorDetails(
      axiosErrorWithCode('UNAUTHORIZED', 'Expired'),
    );
    expect(details.code).toBe('UNAUTHORIZED');
    expect(details.message).toBe('Expired');
  });

  it('toasts the generic session copy for UNAUTHORIZED (not server-message-wins)', () => {
    expect(
      toErrorToast(axiosErrorWithCode('UNAUTHORIZED', 'Expired')).message,
    ).toBe('Your session has ended. Please sign in again.');
  });
});
