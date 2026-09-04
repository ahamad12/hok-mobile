import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetName } from '@/constants/SheetConstants';
import { useAppStyles } from '@/hooks/useAppStyles';
import { useTheme } from '@/hooks/useTheme';
import { ColorPallete } from '@/theme/Colors';
import { borderRadius, spacing } from '@/theme/Common';
import { sheetRegistry } from '@/utils/sheetRegistry';

import { AppIcon } from './AppIcon';

export interface AppBottomSheetRef {
  open: () => void;
  close: () => void;
}

export interface AppBottomSheetProps {
  name?: SheetName;
  children?: React.ReactNode;
  onClose?: () => void;
  style?: ViewStyle;
}

export const AppBottomSheet = forwardRef<
  AppBottomSheetRef,
  AppBottomSheetProps
>(({ name, children, onClose, style }, ref) => {
  const theme = useTheme();
  const dynamicStyles = useAppStyles(stylesFunc);
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const open = useCallback(() => sheetRef.current?.present(), []);
  const close = useCallback(() => {
    if (name) sheetRegistry.notifyDismissed(name);
    sheetRef.current?.dismiss();
    onClose?.();
  }, [name, onClose]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => {
    if (!name) return undefined;
    sheetRegistry.register(name, { open, close });
    return () => sheetRegistry.unregister(name);
  }, [name, open, close]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior='close'
        opacity={0.45}
        onPress={close}
      />
    ),
    [close],
  );

  const effectiveBottomInset =
    keyboardHeight > 0 ? keyboardHeight + spacing[2] : spacing[6];
  const maxSheetHeight =
    Dimensions.get('window').height -
    effectiveBottomInset -
    insets.top -
    spacing[4];

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose={false}
      android_keyboardInputMode='adjustResize'
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, dynamicStyles.backgroundStyle]}
      handleComponent={null}
      detached
      bottomInset={effectiveBottomInset}
      maxDynamicContentSize={maxSheetHeight}
      style={styles.sheet}
    >
      <View style={styles.grabber} />
      <Pressable
        onPress={close}
        style={[styles.closeButton, dynamicStyles.closeButtonStyle]}
        accessibilityRole='button'
        accessibilityLabel='Close'
      >
        <AppIcon
          name='X'
          size={theme.iconSize.sm}
          color={theme.colors.text.secondary}
        />
      </Pressable>
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        style={style}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

AppBottomSheet.displayName = 'AppBottomSheet';

const stylesFunc = (colors: ColorPallete) => ({
  backgroundStyle: { backgroundColor: colors.background.surface },
  closeButtonStyle: { backgroundColor: colors.background.subtle },
});

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: spacing[3],
  },
  background: {
    borderRadius: borderRadius['2xl'],
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(120,120,128,0.36)',
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  closeButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
});
