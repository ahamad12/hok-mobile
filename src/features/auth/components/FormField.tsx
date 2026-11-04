import React, { ComponentProps } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { AppInput } from '@/components/AppInput';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
} & Omit<ComponentProps<typeof AppInput>, 'value' | 'onChangeText' | 'onBlur'>;

/** AppInput bound to a react-hook-form field, showing its error. */
export function FormField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <AppInput
          {...inputProps}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
