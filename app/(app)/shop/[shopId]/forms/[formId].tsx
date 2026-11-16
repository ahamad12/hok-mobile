import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppActivityIndicator } from '@/components/AppActivityIndicator';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { ListItem, ListSection } from '@/components/ListItem';
import { SegmentedControl } from '@/components/SegmentedControl';
import { getErrorMessage, getFieldErrors } from '@/constants/ApiErrors';
import {
  useSubmitForm,
  useUpdateForm,
} from '@/features/forms/api/forms.mutations';
import {
  useFormSubmissions,
  useShopForm,
} from '@/features/forms/api/forms.queries';
import { FormAnswers } from '@/features/forms/api/forms.types';
import { DynamicField } from '@/features/forms/components/DynamicField';
import {
  toSubmission,
  validateAnswers,
} from '@/features/forms/utils/formAnswers';
import { FormScreen } from '@/features/shops/components/FormScreen';
import { useShopId, useShopRole } from '@/features/shops/hooks/useShopContext';
import { useToast } from '@/hooks/useToast';
import { spacing } from '@/theme/Common';
import { formatRelativeTime } from '@/utils/time';

type Mode = 'fill' | 'responses';

/** Fill a form; owners/managers also see responses and can hide it. */
export default function FormDetailScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const router = useRouter();
  const shopId = useShopId();
  const { manages } = useShopRole();
  const toast = useToast();
  const form = useShopForm(formId);
  const submissions = useFormSubmissions(formId, manages);
  const submit = useSubmitForm(formId);
  const update = useUpdateForm(shopId, formId);

  const [mode, setMode] = useState<Mode>('fill');
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const f = form.data;
  if (!f) {
    return (
      <FormScreen title='Form'>
        <AppActivityIndicator />
      </FormScreen>
    );
  }

  const send = () => {
    setFormError(null);
    const local = validateAnswers(f.schema, answers);
    setErrors(local);
    if (Object.keys(local).length) return;
    submit.mutate(toSubmission(f.schema, answers), {
      onSuccess: () => {
        toast.success(f.title, 'Submitted');
        router.back();
      },
      onError: (e) => {
        const byField = Object.fromEntries(
          Object.entries(getFieldErrors(e)).map(([k, v]) => [
            k.replace(/^answers\./, ''),
            v,
          ]),
        );
        setErrors(byField);
        if (!Object.keys(byField).length) setFormError(getErrorMessage(e));
      },
    });
  };

  const labelOf = (name: string) =>
    f.schema.find((x) => x.name === name)?.label ?? name;

  return (
    <FormScreen
      title={f.title}
      error={formError}
      footer={
        mode === 'fill' && f.isActive ? (
          <AppButton onPress={send} loading={submit.isPending} fullWidth>
            Submit
          </AppButton>
        ) : undefined
      }>
      {manages ? (
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'fill', label: 'Fill in' },
            {
              value: 'responses',
              label: 'Responses',
              count: submissions.data?.total,
            },
          ]}
        />
      ) : null}

      {f.description ? (
        <AppText variant='body' color='secondary'>
          {f.description}
        </AppText>
      ) : null}

      {mode === 'fill' ? (
        <View style={styles.fields}>
          {f.schema.map((field) => (
            <DynamicField
              key={field.name}
              field={field}
              value={answers[field.name]}
              error={errors[field.name]}
              onChange={(v) => {
                setAnswers((a) => ({ ...a, [field.name]: v }));
                if (errors[field.name])
                  setErrors(({ [field.name]: _, ...rest }) => rest);
              }}
            />
          ))}
        </View>
      ) : (
        <>
          <ListSection title='Latest responses'>
            {(submissions.data?.submissions ?? []).length === 0 ? (
              <ListItem icon='Inbox' title='No responses yet' />
            ) : (
              submissions.data?.submissions.map((s) => (
                <ListItem
                  key={s.id}
                  icon='FileCheck'
                  title={formatRelativeTime(s.submittedAt)}
                  titleLines={1}
                  subtitle={Object.entries(s.answers)
                    .slice(0, 3)
                    .map(
                      ([k, v]) =>
                        `${labelOf(k)}: ${Array.isArray(v) ? v.join(', ') : String(v)}`,
                    )
                    .join(' · ')}
                />
              ))
            )}
          </ListSection>
          <ListSection>
            <ListItem
              icon={f.isActive ? 'EyeOff' : 'Eye'}
              title={f.isActive ? 'Hide from staff' : 'Show to staff'}
              chevron={false}
              onPress={() =>
                update.mutate(
                  { isActive: !f.isActive },
                  {
                    onSuccess: () =>
                      toast.success(
                        f.isActive ? 'Form hidden' : 'Form visible',
                      ),
                  },
                )
              }
            />
          </ListSection>
        </>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({ fields: { gap: spacing[5] } });
