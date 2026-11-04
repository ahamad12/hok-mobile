import { useCallback, useState } from 'react';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { getErrorMessage, getFieldErrors } from '@/constants/ApiErrors';

/**
 * Puts server validation errors on their form fields; anything that doesn't
 * map to a field becomes the form-level message.
 */
export function useServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  const [formError, setFormError] = useState<string | null>(null);

  const onError = useCallback(
    (error: unknown) => {
      const byField = getFieldErrors(error);
      let mapped = false;
      for (const f of fields) {
        if (byField[f]) {
          setError(f, { type: 'server', message: byField[f] });
          mapped = true;
        }
      }
      setFormError(mapped ? null : getErrorMessage(error));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setError],
  );

  return { formError, setFormError, onError };
}
