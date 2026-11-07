import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { AppBottomSheet, AppBottomSheetRef } from './AppBottomSheet';
import { AppButton } from './AppButton';
import { AppIcon, IconName } from './AppIcon';
import { AppText } from './AppText';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: IconName;
  onConfirm: () => void | Promise<unknown>;
}

export interface ConfirmSheetRef {
  ask: (options: ConfirmOptions) => void;
}

/**
 * One sheet per screen; call `ref.current?.ask({...})` to confirm an action.
 * Waits for a returned promise so the button can show progress.
 */
export const ConfirmSheet = forwardRef<ConfirmSheetRef>((_, ref) => {
  const { colors } = useColors();
  const sheet = useRef<AppBottomSheetRef>(null);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);

  useImperativeHandle(ref, () => ({
    ask: (o) => {
      setOpts(o);
      setBusy(false);
      sheet.current?.open();
    },
  }));

  const confirm = async () => {
    if (!opts) return;
    try {
      setBusy(true);
      await opts.onConfirm();
    } finally {
      setBusy(false);
      sheet.current?.close();
    }
  };

  const destructive = opts?.destructive ?? true;
  const tint = destructive ? colors.icon.error : colors.brand.primary;
  const tintBg = destructive
    ? colors.background.errorSubtle
    : colors.background.surface;

  return (
    <AppBottomSheet ref={sheet}>
      <View style={styles.wrap}>
        <View style={[styles.icon, { backgroundColor: tintBg }]}>
          <AppIcon
            name={opts?.icon ?? (destructive ? 'TriangleAlert' : 'CircleHelp')}
            size={26}
            color={tint}
          />
        </View>
        <AppText variant='h5' align='center'>
          {opts?.title ?? ''}
        </AppText>
        {opts?.message ? (
          <AppText variant='bodySmall' color='secondary' align='center'>
            {opts.message}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          <AppButton
            variant='tertiary'
            onPress={() => sheet.current?.close()}
            style={styles.flex}
            disabled={busy}>
            {opts?.cancelLabel ?? 'Cancel'}
          </AppButton>
          <AppButton
            variant='primary'
            onPress={confirm}
            loading={busy}
            // The confirm step is the one place a solid red is earned.
            style={
              destructive
                ? {
                    ...styles.flex,
                    backgroundColor: colors.button.destructive.default,
                  }
                : styles.flex
            }
            textStyle={destructive ? { color: '#FFFFFF' } : undefined}>
            {opts?.confirmLabel ?? 'Confirm'}
          </AppButton>
        </View>
      </View>
    </AppBottomSheet>
  );
});

ConfirmSheet.displayName = 'ConfirmSheet';

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
    alignSelf: 'stretch',
  },
  flex: { flex: 1 },
});
