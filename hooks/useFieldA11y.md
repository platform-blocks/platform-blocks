# useFieldA11y

Wire a custom form control to its label, description, error and helper text, using the same contract as every plocks field. On web it links them with ids and `aria-*` references; on native, where id references don't work, it composes the control's label and hint instead.

## Metadata

- Import: `import { useFieldA11y } from '@plocks/ui';`
- Tags: accessibility, form, label, aria
- Docs: https://plocks.dev/hooks/useFieldA11y
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/accessibility/useFieldA11y.ts

## Definition

```ts
export interface UseFieldA11yOptions {
  /** Base id. The control gets it verbatim; parts get `${id}-label` etc. Generated when omitted. */
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error message. A truthy non-boolean error is rendered and implies `invalid`. */
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
  /** Defaults to `!!error`. */
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Explicit accessible name for the control; replaces the label reference. */
  accessibilityLabel?: string;
  /** Extra native hint appended after the composed description/error. */
  accessibilityHint?: string;
  /** Word appended to the native label for required fields. Default `'required'`. */
  requiredText?: string;
}

export interface UseFieldA11yResult {
  ids: FieldA11yIds;
  /** Spread on the focusable control (TextInput, Pressable, ...). */
  controlProps: A11yProps;
  /** Spread on the label text. */
  labelProps: FieldPartProps;
  /** Spread on the description text. */
  descriptionProps: FieldPartProps;
  /** Spread on the error container: role="alert" + aria-live="polite". */
  errorProps: FieldErrorProps;
  /** Spread on the helper text. */
  helperProps: FieldPartProps;
  invalid: boolean;
  /** Whether the footer should render the error (vs. helper text). */
  showError: boolean;
  /** Whether the footer should render helper text. */
  showHelper: boolean;
}

export interface FieldA11yIds {
  control: string;
  label: string;
  description: string;
  error: string;
  helper: string;
}

export interface FieldPartProps {
  id: string;
}

export interface FieldErrorProps extends FieldPartProps {
  role: 'alert';
  'aria-live': 'polite';
}

export function useFieldA11y(options: UseFieldA11yOptions): UseFieldA11yResult;
```

## Examples

### Custom text field

A plain `TextInput` wired like a plocks field. `useFieldA11y({ label, description, error, helperText, required, … })` returns `controlProps` for the control, `labelProps` / `descriptionProps` / `errorProps` / `helperProps` for the text around it, and `showError` / `showHelper`: the error replaces the helper text, and only the text that is rendered is referenced. Web gets `aria-labelledby`, `aria-describedby`, `aria-invalid` and `aria-required`; native gets a composed label ("Username, required") and a hint built from the error, description and helper text. `errorProps` makes the error a polite `role="alert"`, but iOS has no live regions, so call `announce()` for a new error when it must be spoken there.

```tsx
import { useState } from 'react';
import { TextInput } from 'react-native';
import { Block, Text, useFieldA11y, useTheme } from '@plocks/ui';

const LABEL = 'Username';
const HELPER = 'Lowercase letters and numbers, 3–16 characters.';

export function Demo() {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const error = /[^a-z0-9]/.test(value) ? 'Only lowercase letters and numbers are allowed.' : undefined;

  const { controlProps, labelProps, errorProps, helperProps, invalid, showError, showHelper } = useFieldA11y({
    label: LABEL,
    helperText: HELPER,
    error,
    required: true,
  });

  return (
    <Block fullWidth maw={360} gap="xs">
      <Text {...labelProps} fw="600">
        {LABEL}
        <Text c="error" aria-hidden>
          {' *'}
        </Text>
      </Text>

      <TextInput
        {...controlProps}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: invalid ? theme.colors.error[5] : theme.backgrounds.borderStrong,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
          fontFamily: theme.fontFamily,
          color: theme.text.primary,
        }}
      />

      {showError ? (
        <Block {...errorProps} accessible>
          <Text size="sm" c="error">
            {error}
          </Text>
        </Block>
      ) : showHelper ? (
        <Text {...helperProps} size="sm" c="muted">
          {HELPER}
        </Text>
      ) : null}
    </Block>
  );
}
```
