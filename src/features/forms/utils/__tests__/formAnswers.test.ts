import { FormField } from '../../api/forms.types';
import { fieldNameFrom, toSubmission, validateAnswers } from '../formAnswers';

const fields: FormField[] = [
  { type: 'text', name: 'who', label: 'Who', required: true },
  {
    type: 'number',
    name: 'temp',
    label: 'Temp',
    required: false,
    min: 0,
    max: 8,
  },
  { type: 'checkbox', name: 'ok', label: 'Checked', required: true },
  {
    type: 'multiselect',
    name: 'areas',
    label: 'Areas',
    required: false,
    options: ['A', 'B'],
  },
];

describe('validateAnswers', () => {
  it('flags missing required answers, including an unticked checkbox', () => {
    expect(validateAnswers(fields, { ok: false })).toEqual({
      who: 'Required',
      ok: 'Required',
    });
  });

  it('checks number bounds', () => {
    expect(validateAnswers(fields, { who: 'x', ok: true, temp: '9' })).toEqual({
      temp: 'At most 8',
    });
    expect(validateAnswers(fields, { who: 'x', ok: true, temp: '4' })).toEqual(
      {},
    );
  });
});

describe('toSubmission', () => {
  it('converts numbers and drops blanks', () => {
    expect(
      toSubmission(fields, { who: 'Amy', temp: '4.5', ok: true, areas: [] }),
    ).toEqual({
      who: 'Amy',
      temp: 4.5,
      ok: true,
    });
  });
});

it('derives unique field names from labels', () => {
  const taken = new Set(['fridge_temp']);
  expect(fieldNameFrom('Fridge temp', taken)).toBe('fridge_temp_2');
  expect(fieldNameFrom('  !!  ', new Set())).toBe('field');
});
