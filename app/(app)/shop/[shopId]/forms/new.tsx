import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBottomSheet, AppBottomSheetRef } from '@/components/AppBottomSheet';
import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { AppToggle } from '@/components/AppToggle';
import { IconButton } from '@/components/IconButton';
import { ListItem, ListSection } from '@/components/ListItem';
import { SelectField } from '@/components/SelectField';
import { getErrorMessage } from '@/constants/ApiErrors';
import { useColors } from '@/contexts/ColorContext';
import { useCreateForm } from '@/features/forms/api/forms.mutations';
import { FormField } from '@/features/forms/api/forms.types';
import { fieldNameFrom } from '@/features/forms/utils/formAnswers';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';

type BuildType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'email';

const TYPES: { value: BuildType; label: string; description: string }[] = [
  { value: 'text', label: 'Short answer', description: 'One line of text' },
  { value: 'textarea', label: 'Long answer', description: 'Paragraphs' },
  {
    value: 'number',
    label: 'Number',
    description: 'e.g. a temperature or count',
  },
  { value: 'date', label: 'Date', description: 'YYYY-MM-DD' },
  { value: 'checkbox', label: 'Tick box', description: 'Yes / done' },
  { value: 'select', label: 'Pick one', description: 'From a list' },
  { value: 'multiselect', label: 'Pick several', description: 'From a list' },
  { value: 'email', label: 'Email', description: 'An email address' },
];
const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t;
const needsOptions = (t: BuildType) => t === 'select' || t === 'multiselect';

/** Simple form builder (OWNER/MANAGER). Uploads and signatures are web-only for now. */
export default function NewFormScreen() {
  const router = useRouter();
  const shopId = useShopId();
  const { colors } = useColors();
  const toast = useToast();
  const create = useCreateForm(shopId);
  const sheet = useRef<AppBottomSheetRef>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Field being added.
  const [label, setLabel] = useState('');
  const [type, setType] = useState<BuildType>('text');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const openAdd = () => {
    setLabel('');
    setType('text');
    setRequired(false);
    setOptions('');
    setFieldError(null);
    sheet.current?.open();
  };

  const addField = () => {
    const l = label.trim();
    if (!l) {
      setFieldError('Give the question a label');
      return;
    }
    const opts = options
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (needsOptions(type) && opts.length < 1) {
      setFieldError('Add at least one option, separated by commas');
      return;
    }
    const name = fieldNameFrom(l, new Set(fields.map((f) => f.name)));
    const base = { name, label: l, required };
    const field: FormField = needsOptions(type)
      ? { ...base, type: type as 'select' | 'multiselect', options: opts }
      : ({ ...base, type } as FormField);
    setFields((fs) => [...fs, field]);
    sheet.current?.close();
  };

  const save = () => {
    setError(null);
    if (title.trim().length < 1) {
      setError('Give the form a title');
      return;
    }
    if (fields.length === 0) {
      setError('Add at least one question');
      return;
    }
    create.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        schema: fields,
      },
      {
        onSuccess: (f) => {
          toast.success(`${f.title} is ready for staff`, 'Form created');
          router.back();
        },
        onError: (e) => setError(getErrorMessage(e)),
      },
    );
  };

  return (
    <FormScreen
      title='New form'
      dismiss='close'
      error={error}
      footer={
        <AppButton onPress={save} loading={create.isPending} fullWidth>
          Create form
        </AppButton>
      }>
      <AppInput
        label='Title'
        value={title}
        onChangeText={setTitle}
        placeholder='e.g. Opening checklist'
        maxLength={200}
      />
      <AppInput
        label='Description (optional)'
        value={description}
        onChangeText={setDescription}
        placeholder='When and why to fill it in'
        maxLength={500}
      />

      <ListSection
        title='Questions'
        action={
          <AppButton variant='ghost' size='sm' onPress={openAdd}>
            Add
          </AppButton>
        }>
        {fields.length === 0 ? (
          <ListItem
            icon='Plus'
            title='Add your first question'
            onPress={openAdd}
          />
        ) : (
          fields.map((f, i) => (
            <ListItem
              key={f.name}
              icon='GripVertical'
              title={f.required ? `${f.label} *` : f.label}
              subtitle={`${typeLabel(f.type)}${'options' in f ? ` · ${f.options.join(', ')}` : ''}`}
              trailing={
                <IconButton
                  icon='Trash2'
                  label={`Remove ${f.label}`}
                  size={36}
                  onPress={() =>
                    setFields((fs) => fs.filter((_, j) => j !== i))
                  }
                  style={{ backgroundColor: colors.background.default }}
                />
              }
            />
          ))
        )}
      </ListSection>

      <AppBottomSheet ref={sheet} title='Add question'>
        <View style={styles.sheet}>
          {fieldError ? (
            <AppText variant='bodySmall' color='error'>
              {fieldError}
            </AppText>
          ) : null}
          <AppInput
            label='Question'
            value={label}
            onChangeText={setLabel}
            placeholder='e.g. Fridge temperature'
            maxLength={150}
          />
          <SelectField<BuildType>
            label='Answer type'
            options={TYPES}
            value={type}
            onChange={setType}
          />
          {needsOptions(type) ? (
            <AppInput
              label='Options'
              value={options}
              onChangeText={setOptions}
              placeholder='Separate with commas: Good, Needs attention'
            />
          ) : null}
          <View style={styles.toggleRow}>
            <AppText weight='semibold' style={styles.flex}>
              Required
            </AppText>
            <AppToggle value={required} onValueChange={setRequired} />
          </View>
          <AppButton onPress={addField} fullWidth>
            Add question
          </AppButton>
        </View>
      </AppBottomSheet>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: spacing[5], gap: spacing[4] },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  flex: { flex: 1 },
});
