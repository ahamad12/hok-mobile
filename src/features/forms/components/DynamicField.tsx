import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { AppToggle } from '@/components/AppToggle';
import { SelectField } from '@/components/SelectField';
import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { FormField } from '../api/forms.types';

type Props = {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
};

/** Field types the app can't capture yet (uploads, drawing). */
export const UNSUPPORTED_TYPES = new Set(['file', 'image', 'signature']);

/** Renders one field of a server-defined form schema. */
export function DynamicField({ field, value, onChange, error }: Props) {
  const { colors } = useColors();
  const label = field.required ? `${field.label} *` : field.label;

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
      return (
        <AppInput
          label={label}
          value={(value as string) ?? ''}
          onChangeText={onChange}
          placeholder={'placeholder' in field ? field.placeholder : undefined}
          helperText={field.helpText}
          error={error}
          multiline={field.type === 'textarea'}
          keyboardType={field.type === 'email' ? 'email-address' : 'default'}
          autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
          maxLength={'maxLength' in field ? field.maxLength : undefined}
        />
      );
    case 'number':
      return (
        <AppInput
          label={label}
          value={value === undefined || value === null ? '' : String(value)}
          onChangeText={(t) => onChange(t === '' ? undefined : t)}
          keyboardType='decimal-pad'
          helperText={
            field.helpText ??
            (field.min !== undefined || field.max !== undefined
              ? `Between ${field.min ?? '…'} and ${field.max ?? '…'}`
              : undefined)
          }
          error={error}
        />
      );
    case 'date':
      return (
        <AppInput
          label={label}
          value={(value as string) ?? ''}
          onChangeText={onChange}
          placeholder='YYYY-MM-DD'
          keyboardType='numbers-and-punctuation'
          helperText={field.helpText}
          error={error}
        />
      );
    case 'select':
    case 'radio':
      return (
        <SelectField
          label={label}
          options={field.options.map((o) => ({ value: o, label: o }))}
          value={(value as string) ?? null}
          onChange={onChange}
          helperText={field.helpText}
          error={error}
        />
      );
    case 'multiselect': {
      const picked = Array.isArray(value) ? (value as string[]) : [];
      return (
        <View style={styles.group}>
          <AppText variant='label' color='secondary'>
            {label}
          </AppText>
          <View style={styles.wrap}>
            {field.options.map((o) => {
              const on = picked.includes(o);
              return (
                <Pressable
                  key={o}
                  onPress={() =>
                    onChange(
                      on ? picked.filter((p) => p !== o) : [...picked, o],
                    )
                  }
                  accessibilityRole='checkbox'
                  accessibilityState={{ checked: on }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: on
                        ? colors.button.primary.default
                        : colors.background.surface,
                    },
                  ]}>
                  <AppText
                    variant='label'
                    customColor={
                      on ? colors.text.inverse : colors.text.primary
                    }>
                    {o}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {error ? (
            <AppText variant='caption' color='error'>
              {error}
            </AppText>
          ) : null}
        </View>
      );
    }
    case 'checkbox':
      return (
        <View style={styles.group}>
          <View style={styles.toggleRow}>
            <AppText weight='semibold' style={styles.flex}>
              {label}
            </AppText>
            <AppToggle value={value === true} onValueChange={onChange} />
          </View>
          {field.helpText || error ? (
            <AppText variant='caption' color={error ? 'error' : 'tertiary'}>
              {error ?? field.helpText}
            </AppText>
          ) : null}
        </View>
      );
    default:
      return (
        <View
          style={[
            styles.unsupported,
            { backgroundColor: colors.background.surface },
          ]}>
          <AppIcon name='Paperclip' size={18} color={colors.icon.tertiary} />
          <View style={styles.flex}>
            <AppText weight='semibold'>{label}</AppText>
            <AppText variant='caption' color={error ? 'error' : 'tertiary'}>
              {error ??
                'Uploads and signatures are not available in the app yet.'}
            </AppText>
          </View>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  group: { gap: spacing[2] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  flex: { flex: 1 },
  unsupported: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
});
