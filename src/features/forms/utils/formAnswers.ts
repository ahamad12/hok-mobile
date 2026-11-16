import { FormAnswers, FormField } from '../api/forms.types';

/**
 * Client-side pass mirroring the server's form-answer-validation for the
 * common cases, so the user sees errors before submitting. The server
 * re-validates every answer (422 with per-field errors).
 */
export function validateAnswers(
  fields: FormField[],
  answers: FormAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = answers[f.name];
    const empty =
      v === undefined ||
      v === null ||
      v === '' ||
      (Array.isArray(v) && v.length === 0) ||
      (f.type === 'checkbox' && v !== true);
    if (empty) {
      if (f.required) errors[f.name] = 'Required';
      continue;
    }
    if (f.type === 'number') {
      const n = Number(v);
      if (Number.isNaN(n)) errors[f.name] = 'Enter a number';
      else if (f.min !== undefined && n < f.min)
        errors[f.name] = `At least ${f.min}`;
      else if (f.max !== undefined && n > f.max)
        errors[f.name] = `At most ${f.max}`;
    }
    if (
      f.type === 'email' &&
      typeof v === 'string' &&
      !/^\S+@\S+\.\S+$/.test(v)
    ) {
      errors[f.name] = 'Enter a valid email';
    }
    if (
      f.type === 'date' &&
      typeof v === 'string' &&
      !/^\d{4}-\d{2}-\d{2}$/.test(v)
    ) {
      errors[f.name] = 'Use YYYY-MM-DD';
    }
  }
  return errors;
}

/** Numbers typed as text go to the server as numbers; blanks are dropped. */
export function toSubmission(
  fields: FormField[],
  answers: FormAnswers,
): FormAnswers {
  const out: FormAnswers = {};
  for (const f of fields) {
    const v = answers[f.name];
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))
      continue;
    out[f.name] = f.type === 'number' ? Number(v) : v;
  }
  return out;
}

/** "my field" -> "my_field", unique within the form. */
export function fieldNameFrom(label: string, taken: Set<string>): string {
  const base =
    label
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '_')
      .replaceAll(/^_+|_+$/g, '')
      .slice(0, 40) || 'field';
  let name = base;
  let i = 2;
  while (taken.has(name)) name = `${base}_${i++}`;
  return name;
}
