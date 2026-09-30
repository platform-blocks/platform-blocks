import { withStatics } from '../../core/factory/factory';
import { FormBase } from './FormBase';
import { FormError } from './FormError';
import { FormField } from './FormField';
import { FormInput } from './FormInput';
import { FormLabel } from './FormLabel';
import { FormSubmit } from './FormSubmit';

export const Form = withStatics(FormBase, {
  Field: FormField,
  Input: FormInput,
  Label: FormLabel,
  Error: FormError,
  Submit: FormSubmit,
});

export { FormField, FormInput, FormLabel, FormError, FormSubmit };

export type {
  FormProps,
  FormFieldProps,
  FormFieldDependency,
  FormFieldBinding,
  FormInputProps,
  FormLabelProps,
  FormErrorProps,
  FormSubmitProps,
  FormValues,
  ValidationSchema,
  FormContextValue,
} from './types';

export { useFormContext, useOptionalFormContext } from './FormContext';
