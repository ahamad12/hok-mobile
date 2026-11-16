// Mirrors tapt-api packages/api/src/contracts/form.contract.ts.

type BaseField = {
  name: string;
  label: string;
  required: boolean;
  helpText?: string;
};

export type FormField =
  | (BaseField & {
      type: 'text' | 'textarea';
      placeholder?: string;
      maxLength?: number;
    })
  | (BaseField & { type: 'number'; min?: number; max?: number })
  | (BaseField & {
      type: 'email' | 'date' | 'checkbox' | 'image' | 'signature';
    })
  | (BaseField & {
      type: 'select' | 'multiselect' | 'radio';
      options: string[];
    })
  | (BaseField & { type: 'file'; accept?: string[] });

export type FormFieldType = FormField['type'];

export type Form = {
  id: string;
  shopId: string;
  title: string;
  description: string | null;
  schema: FormField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FormAnswers = Record<string, unknown>;

export type FormSubmission = {
  id: string;
  formId: string;
  staffId: string;
  answers: FormAnswers;
  submittedAt: string;
};

export type CreateFormInput = {
  shopId: string;
  title: string;
  description?: string;
  schema: FormField[];
};

export type UpdateFormInput = {
  title?: string;
  description?: string | null;
  schema?: FormField[];
  isActive?: boolean;
};
