import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { AppBottomSheet, AppBottomSheetRef } from './AppBottomSheet';
import { AppIcon, IconName } from './AppIcon';
import { AppText } from './AppText';
import { IconTile } from './ListItem';

export interface SheetOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: IconName;
}

export interface OptionSheetProps<T extends string> {
  title: string;
  subtitle?: string;
  options: SheetOption<T>[];
  value?: T | null;
  /** Commits immediately and closes the sheet. */
  onSelect: (value: T) => void;
}

export interface OptionSheetRef {
  open: () => void;
  close: () => void;
}

function OptionSheetInner<T extends string>(
  { title, subtitle, options, value, onSelect }: OptionSheetProps<T>,
  ref: React.Ref<OptionSheetRef>,
) {
  const { colors } = useColors();
  const sheet = useRef<AppBottomSheetRef>(null);

  useImperativeHandle(ref, () => ({
    open: () => sheet.current?.open(),
    close: () => sheet.current?.close(),
  }));

  return (
    <AppBottomSheet ref={sheet} title={title} subtitle={subtitle}>
      <View style={styles.list}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                onSelect(o.value);
                sheet.current?.close();
              }}
              accessibilityRole='radio'
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: colors.background.overlay },
              ]}>
              {o.icon ? (
                <IconTile icon={o.icon} tone={selected ? 'brand' : 'neutral'} />
              ) : null}
              <View style={styles.body}>
                <AppText
                  variant='body'
                  weight={selected ? 'semibold' : 'medium'}>
                  {o.label}
                </AppText>
                {o.description ? (
                  <AppText variant='caption' color='secondary'>
                    {o.description}
                  </AppText>
                ) : null}
              </View>
              {selected ? (
                <AppIcon name='Check' size={20} color={colors.brand.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </AppBottomSheet>
  );
}

export const OptionSheet = forwardRef(OptionSheetInner) as <T extends string>(
  props: OptionSheetProps<T> & { ref?: React.Ref<OptionSheetRef> },
) => ReturnType<typeof OptionSheetInner>;

const styles = StyleSheet.create({
  list: { paddingBottom: spacing[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    minHeight: 56,
  },
  body: { flex: 1, gap: 2 },
});
