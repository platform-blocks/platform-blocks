# Form

Form manages values, validation, and submission state for a group of inputs.

## Metadata

- Import: `import { Form } from '@plocks/ui';`
- Tags: form, fields, validation, submit
- Docs: https://plocks.dev/components/Form
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Form

## Props

- `initialValues`: FormValues — Initial form values
- `validationSchema`: ValidationSchema — Form validation schema
- `onSubmit`: (values: FormValues) => void | Promise<void> — Submit handler
- `validate`: (values: FormValues) => Record<string, string> | Promise<Record<string, string>> — Validation handler
- `disabled`: boolean — Whether form is disabled
- `validateOnChange`: boolean — Whether to validate on change
- `validateOnBlur`: boolean — Whether to validate on blur
- `children` (required): React.ReactNode — Children components
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

### Form.Field

- `name`: string — Field name (binds the field to the enclosing `Form`).
- `dependsOn`: FormFieldDependency[] — Field dependencies for conditional logic
- `validateWhen`: { field: string; condition: (value: unknown, formValues: FormValues) => boolean; } — Only validate this field (its `validation` rules) while the condition holds.
- `validation`: ValidationRule[] — Validation rules for this field, added to the form's `validationSchema`.
- `label`: React.ReactNode — Label rendered above (or beside) the field.
- `description`: React.ReactNode — Description rendered under the label.
- `error`: React.ReactNode — Error message. Defaults to the form's error for `name` once touched (when a label is shown).
- `helperText`: React.ReactNode — Helper text under the field when there is no error.
- `required`: boolean — Marks the field required.
- `labelPosition`: 'top' | 'start' | 'end' — Where the label goes. `'start'` / `'end'` put it beside the field (logical: they follow the reading direction).
- `children` (required): React.ReactNode — Children components
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Form.Input

- `flex`: number — Flex factor for an input placed beside buttons or icons.
- `inputColor`: string — Color of the editable text.
- `inputFontSize`: number — Editable text size in pixels.
- `id`: string — Id of the TextInput (DOM `id` on web, `nativeID` on native); label/error ids derive from it. Generated when omitted.
- `focused`: boolean — Force the focused look regardless of real focus.
- `textInputProps`: ExtendedTextInputProps — Additional TextInput props.
- `inputRef`: React.Ref<TextInput> — Extra ref to the TextInput; merged with `ref`.
- `secureTextEntry`: boolean — Force secure entry regardless of type.
- `containerProps`: Omit<ViewProps, 'style' | 'testID' | 'children'> — Props for the root `View` (gesture handlers, onLayout, ...).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Input` props (`type` `validation` `autoComplete` `keyboardType` `multiline` `numberOfLines` `minLines` `maxLines` `maxLength` `autoCapitalize` `autoCorrect` `autoFocus` `returnKeyType` `blurOnSubmit` `selectTextOnFocus` `textContentType` `textAlign` `spellCheck` `inputMode` `enterKeyHint` `selectionColor` `showSoftInputOnFocus` `editable`): https://plocks.dev/llms/components/Input.md

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`value` `defaultValue` `onChangeText` `placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `debounceMs` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

### Form.Submit

- `children` (required): React.ReactNode — Submit button content
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Button` props (`onPressIn` `onPressOut` `onHoverIn` `onHoverOut` `onLongPress` `onLayout` `variant` `color` `size` `disabled` `loading` `loadingTitle` `fullWidth` `textColor` `icon` `startSection` `endSection` `tooltip` `transitionDuration` `accessibilityLabel` `accessibilityHint` `labelProps`): https://plocks.dev/llms/components/Button.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useFormContext(): FormContextValue` — Returns the enclosing `Form`'s state and actions (`values`, `errors`, `touched`, `isSubmitting`, `isValid`, `setFieldValue`, `getFieldProps`, `submitForm`, `resetForm`, …) for custom fields and buttons, and throws outside a `Form` — use `useOptionalFormContext()` for a non-throwing read.
- `useOptionalFormContext(): FormContextValue | null` — Returns the enclosing `Form`'s state and actions, or `null` outside one — the non-throwing variant of `useFormContext()`, for inputs that bind to a `Form` when there is one and work standalone otherwise.

## Types

```ts
export type FormValues = Record<string, any>;

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export interface FormFieldDependency {
  field: string;
  condition: (value: unknown, formValues: FormValues) => boolean;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}
```

## Examples

### Basics

`Form` manages values, validation, and submission state. Give each `Form.Field` a `name` and put a `Form.Input` inside it (it binds to that field's value, change handler and error), then trigger submission with `Form.Submit`.

```tsx
import { Block, Form } from '@plocks/ui';

export function Demo() {
  return (
    <Form
      initialValues={{ name: '', email: '' }}
      onSubmit={(values) => console.log('submit', values)}
    >
      <Block style={{ width: '100%', maxWidth: 400 }}>
        <Form.Field name="name">
          <Form.Input label="Full name" placeholder="Ada Lovelace" />
        </Form.Field>
        <Form.Field name="email">
          <Form.Input label="Email" placeholder="ada@example.com" />
        </Form.Field>
        <Form.Submit>Create account</Form.Submit>
      </Block>
    </Form>
  );
}
```
