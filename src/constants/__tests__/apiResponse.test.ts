import { AxiosError } from 'axios';

import { unwrap } from '@/constants/ApiResponse';

const config = { headers: {} } as never;

describe('unwrap', () => {
  it('returns data for a success envelope', () => {
    expect(
      unwrap({ data: { success: true, data: { id: 1 } }, config } as never),
    ).toEqual({ id: 1 });
  });

  it('synthesizes an AxiosError for a success:false body on 2xx', () => {
    const response = {
      data: {
        success: false,
        error: { code: 'CONFLICT', message: 'Email taken' },
      },
      config,
    } as never;
    try {
      unwrap(response);
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      expect((error as AxiosError).message).toBe('Email taken');
    }
  });

  it('throws a typed error on a malformed body instead of undefined as T', () => {
    expect(() => unwrap({ data: { hello: 'world' }, config } as never)).toThrow(
      /malformed/i,
    );
    expect(() => unwrap({ data: null, config } as never)).toThrow(/malformed/i);
  });
});
