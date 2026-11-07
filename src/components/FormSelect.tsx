import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { SelectField, SelectFieldProps } from './SelectField';

type Props<T extends FieldValues, V extends string> = {
  control: Control<T>;
  name: Path<T>;
} & Omit<SelectFieldProps<V>, 'value' | 'onChange' | 'error'>;

/** SelectField bound to a react-hook-form field, showing its error. */
export function FormSelect<T extends FieldValues, V extends string>({
  control,
  name,
  ...props
}: Props<T, V>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectField<V>
          {...props}
          value={field.value as V}
          onChange={(v) => {
            field.onChange(v);
            field.onBlur();
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
