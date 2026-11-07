import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { OptionSheet, OptionSheetRef, SheetOption } from './OptionSheet';

export interface SelectFieldProps<T extends string> {
  label: string;
  placeholder?: string;
  options: SheetOption<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  /** Sheet title; defaults to the label. */
  sheetTitle?: string;
}

/** Looks like a filled input; opens an option sheet to pick one value. */
export function SelectField<T extends string>({
  label,
  placeholder = 'Choose…',
  options,
  value,
  onChange,
  error,
  helperText,
  disabled,
  sheetTitle,
}: SelectFieldProps<T>) {
  const { colors } = useColors();
  const sheet = useRef<OptionSheetRef>(null);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      <AppText variant='label' color='secondary'>
        {label}
      </AppText>
      <Pressable
        onPress={() => sheet.current?.open()}
        disabled={disabled}
        accessibilityRole='button'
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: error
              ? colors.background.errorSubtle
              : pressed
                ? colors.background.subtle
                : colors.background.surface,
          },
          disabled && styles.disabled,
        ]}>
        <AppText
          variant='body'
          color={selected ? 'primary' : 'tertiary'}
          numberOfLines={1}
          style={styles.flex}>
          {selected?.label ?? placeholder}
        </AppText>
        <AppIcon name='ChevronDown' size={18} color={colors.icon.tertiary} />
      </Pressable>
      {error ? (
        <AppText variant='caption' color='error'>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant='caption' color='tertiary'>
          {helperText}
        </AppText>
      ) : null}
      <OptionSheet<T>
        ref={sheet}
        title={sheetTitle ?? label}
        options={options}
        value={value ?? null}
        onSelect={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing[2] },
  field: {
    minHeight: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  flex: { flex: 1 },
  disabled: { opacity: 0.5 },
});
