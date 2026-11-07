import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { borderRadius, fontSize, spacing } from '@/theme/Common';
import { familyFor } from '@/theme/fontState';

import { AppIcon } from './AppIcon';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Debounce before `onChangeText` fires, in ms. 0 = immediate. */
  debounceMs?: number;
  style?: ViewStyle;
}

/** Pill-shaped search input with a clear button. */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  debounceMs = 150,
  style,
}) => {
  const { colors } = useColors();
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setText(value), [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleChange = (next: string) => {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    if (debounceMs <= 0) {
      onChangeText(next);
      return;
    }
    timer.current = setTimeout(() => onChangeText(next), debounceMs);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    setText('');
    onChangeText('');
  };

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.background.surface },
        style,
      ]}>
      <AppIcon name='Search' size={20} color={colors.icon.primary} />
      <TextInput
        value={text}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={[
          styles.input,
          { color: colors.text.primary },
          familyFor('500') ? { fontFamily: familyFor('500') } : null,
        ]}
        returnKeyType='search'
        autoCorrect={false}
        autoCapitalize='none'
        clearButtonMode='never'
        maxFontSizeMultiplier={1.5}
        accessibilityLabel={placeholder}
      />
      {text.length > 0 ? (
        <Pressable
          onPress={clear}
          hitSlop={10}
          accessibilityRole='button'
          accessibilityLabel='Clear search'
          style={[styles.clear, { backgroundColor: colors.background.subtle }]}>
          <AppIcon name='X' size={14} color={colors.icon.secondary} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    minHeight: 52,
    paddingHorizontal: spacing[5],
    borderRadius: borderRadius.full,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: spacing[3],
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
