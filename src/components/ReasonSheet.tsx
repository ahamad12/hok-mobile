import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/contexts/ColorContext';
import { spacing } from '@/theme/Common';

import { AppBottomSheet, AppBottomSheetRef } from './AppBottomSheet';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';

export interface ReasonOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  placeholder?: string;
  /** Server rule for voids and reversals: 3–500 characters. */
  minLength?: number;
  onConfirm: (reason: string) => Promise<unknown>;
}

export interface ReasonSheetRef {
  ask: (options: ReasonOptions) => void;
}

/**
 * Asks why before an irreversible correction (void, reverse). The record
 * is kept with the reason, so the copy says "void" rather than "delete".
 * Stays open if the request fails (the mutation shows the error toast).
 */
export const ReasonSheet = forwardRef<ReasonSheetRef>((_, ref) => {
  const { colors } = useColors();
  const sheet = useRef<AppBottomSheetRef>(null);
  const [opts, setOpts] = useState<ReasonOptions | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  useImperativeHandle(ref, () => ({
    ask: (o) => {
      setOpts(o);
      setReason('');
      setTouched(false);
      setBusy(false);
      sheet.current?.open();
    },
  }));

  const min = opts?.minLength ?? 3;
  const tooShort = reason.trim().length < min;

  const confirm = async () => {
    setTouched(true);
    if (!opts || tooShort) return;
    try {
      setBusy(true);
      await opts.onConfirm(reason.trim());
      sheet.current?.close();
    } catch {
      // Error toast comes from the mutation; keep the sheet for a retry.
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppBottomSheet ref={sheet} title={opts?.title} subtitle={opts?.message}>
      <View style={styles.body}>
        <AppInput
          label='Reason'
          placeholder={opts?.placeholder ?? 'What went wrong?'}
          value={reason}
          onChangeText={setReason}
          onBlur={() => setTouched(true)}
          multiline
          maxLength={500}
          error={touched && tooShort ? `At least ${min} characters` : undefined}
        />
        <View style={styles.actions}>
          <AppButton
            variant='tertiary'
            onPress={() => sheet.current?.close()}
            disabled={busy}
            style={styles.flex}>
            Cancel
          </AppButton>
          <AppButton
            onPress={confirm}
            loading={busy}
            style={{
              ...styles.flex,
              backgroundColor: colors.button.destructive.default,
            }}
            textStyle={{ color: '#FFFFFF' }}>
            {opts?.confirmLabel ?? 'Void'}
          </AppButton>
        </View>
      </View>
    </AppBottomSheet>
  );
});

ReasonSheet.displayName = 'ReasonSheet';

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing[5], gap: spacing[5] },
  actions: { flexDirection: 'row', gap: spacing[3] },
  flex: { flex: 1 },
});
