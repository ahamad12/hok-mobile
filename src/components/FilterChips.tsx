import React from 'react';
import { Pressable, ScrollView, StyleSheet, ViewStyle } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, spacing } from '@/theme/Common';

import { AppText } from './AppText';

export interface FilterChip<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface FilterChipsProps<T extends string> {
  options: FilterChip<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

/** Horizontally scrolling single-select pills (filters above a list). */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  style,
}: FilterChipsProps<T>) {
  const { colors } = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
      accessibilityRole='tablist'>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole='tab'
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active
                  ? colors.button.primary.default
                  : pressed
                    ? colors.background.subtle
                    : colors.background.surface,
              },
            ]}>
            <AppText
              variant='label'
              customColor={active ? colors.text.inverse : colors.text.primary}>
              {o.count !== undefined ? `${o.label} · ${o.count}` : o.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing[2], paddingVertical: 2 },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
