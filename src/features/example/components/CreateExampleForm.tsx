import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColors } from '@/contexts';
import { useCreateExample } from '@/features/example/api/example.mutations';
import { createStyleSheet, useAppStyles, useTranslation } from '@/hooks';

export const CreateExampleForm = () => {
  const [title, setTitle] = useState('');
  const { colors } = useColors();
  const dynamicStyles = useAppStyles(stylesFunc);
  const { mutate: createExample, isPending } = useCreateExample();

  const { t } = useTranslation();

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert(t('ERROR_TITLE'), t('ENTER_TITLE'));
      return;
    }

    createExample(
      { title, completed: false },
      {
        onSuccess: () => {
          Alert.alert('SUCCESS_TITLE', t('EXAMPLE_CREATED'));
          setTitle('');
        },
        onError: (error) => {
          Alert.alert(t('ERROR_TITLE'), t('CREATE_FAILED'));
          console.error('Error creating example:', error);
        },
      },
    );
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, dynamicStyles.label]}>
          {t('ENTER_TITLE')}
        </Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          placeholder={t('ENTER_TITLE')}
          placeholderTextColor={colors.text.secondary}
          value={title}
          onChangeText={setTitle}
          editable={!isPending}
          multiline
          numberOfLines={2}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          dynamicStyles.submitButton,
          isPending && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isPending}
        activeOpacity={0.8}>
        <Text style={[styles.submitButtonText, dynamicStyles.submitButtonText]}>
          {isPending ? t('CREATING') : t('CREATE_EXAMPLE')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

const stylesFunc = createStyleSheet((colors) => ({
  container: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 12,
    shadowColor: colors.border.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    color: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: colors.button.primary.default,
    borderWidth: 2,
  },
  submitButton: {
    backgroundColor: colors.button.primary.default,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: colors.button.primary.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.border.disabled,
  },
}));
