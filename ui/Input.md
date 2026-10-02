# Input

Input provides a styled text field with labels, validation states, and helper text.

## Metadata

- Import: `import { Input } from '@plocks/ui';`
- Tags: input, form, text, validation
- Docs: https://plocks.dev/components/Input
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Input

## Props

- `type`: 'text' | 'password' | 'email' | 'tel' | 'number' | 'search' = 'text' — Input type - determines styling and behavior
- `validation`: ValidationRule[] — Validation rules, checked after the field is first blurred and then on every change (debounced by `debounceMs`). The first failing rule's message is shown as the error while no `error` prop is given.
- `autoComplete`: 'off' | 'password' | 'email' | 'tel' | 'url' | 'name' | 'additional-name' | 'address-line1' | 'address-line2' | 'birthdate-day' | 'birthdate-full' | 'birthdate-month' | 'birthdate-year' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-number' | 'country' | 'current-password' | 'family-name' | 'given-name' | 'honorific-prefix' | 'honorific-suffix' | 'new-password' | 'one-time-code' | 'organization' | 'organization-title' | 'postal-code' | 'street-address' | 'username' — Auto-complete type
- `keyboardType`: KeyboardTypeOptions — Keyboard type for mobile
- `multiline`: boolean — Whether input is multiline
- `numberOfLines`: number — Number of lines for multiline input
- `minLines`: number = 1 — Minimum number of lines for multiline input (default: 1)
- `maxLines`: number — Maximum number of lines for multiline input
- `maxLength`: number — Maximum length
- `autoCapitalize`: RNTextInputProps['autoCapitalize'] — Text auto-capitalization behavior
- `autoCorrect`: boolean — Whether to enable auto-correct
- `autoFocus`: boolean — Whether to auto-focus on mount
- `returnKeyType`: RNTextInputProps['returnKeyType'] — Return key type for soft keyboard
- `blurOnSubmit`: boolean — Whether to blur on submit
- `selectTextOnFocus`: boolean — Select all text on focus
- `textContentType`: RNTextInputProps['textContentType'] — iOS text content type for autofill
- `textAlign`: RNTextInputProps['textAlign'] — Text alignment
- `spellCheck`: boolean — Whether spell check is enabled
- `inputMode`: RNTextInputProps['inputMode'] — Input mode (modern alternative to keyboardType)
- `enterKeyHint`: RNTextInputProps['enterKeyHint'] — Hint for the enter key
- `selectionColor`: string — Color of the text selection handles and highlight
- `showSoftInputOnFocus`: boolean — Whether to show the soft keyboard on focus
- `editable`: boolean — Passthrough to the TextInput. Prefer `readOnly`; `editable={false}` behaves the same.
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

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`value` `defaultValue` `onChangeText` `placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `debounceMs` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { PasswordInput, TextInputBase } from '@plocks/ui';`

### PasswordInput

- `showStrengthIndicator`: boolean — Whether to show password strength indicator
- `showVisibilityToggle`: boolean — Whether to show toggle visibility button
- `strengthValidation`: PasswordStrengthRule[] — Password strength validation rules
- `flex`: number — Flex factor for an input placed beside buttons or icons.
- `inputColor`: string — Color of the editable text.
- `inputFontSize`: number — Editable text size in pixels.
- `id`: string — Id of the TextInput (DOM `id` on web, `nativeID` on native); label/error ids derive from it. Generated when omitted.
- `focused`: boolean — Force the focused look regardless of real focus.
- `textInputProps`: ExtendedTextInputProps — Additional TextInput props.
- `inputRef`: React.Ref<TextInput> — Extra ref to the TextInput; merged with `ref`.
- `containerProps`: Omit<ViewProps, 'style' | 'testID' | 'children'> — Props for the root `View` (gesture handlers, onLayout, ...).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Input` props (`validation` `autoComplete` `keyboardType` `multiline` `numberOfLines` `minLines` `maxLines` `maxLength` `autoCapitalize` `autoCorrect` `autoFocus` `returnKeyType` `blurOnSubmit` `selectTextOnFocus` `textContentType` `textAlign` `spellCheck` `inputMode` `enterKeyHint` `selectionColor` `showSoftInputOnFocus` `editable`): https://plocks.dev/llms/components/Input.md

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`value` `defaultValue` `onChangeText` `placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `debounceMs` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

### TextInputBase

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

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`value` `defaultValue` `onChangeText` `placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `debounceMs` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom' | 'passwordStrength';
  value?: ValidationRuleValue;
  message: string;
  /** Custom check for `type: 'custom'`. */
  validator?: ValidatorFunction;
}

export interface PasswordStrengthRule extends Omit<ValidationRule, 'type'> {
  type: 'passwordStrength';
  requirements: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSymbols?: boolean;
  };
}

export type ExtendedTextInputProps = Omit<RNTextInputProps, keyof TextFieldBaseProps> & {
  /** Style of the TextInput itself, merged after the field's text style. */
  style?: RNTextInputProps['style'];
  onKeyDown?: (event: WebKeyboardEvent) => void;
  onKeyUp?: (event: WebKeyboardEvent) => void;
};

export type ValidationRuleValue = number | string | RegExp;

export type ValidatorFunction = {
  bivarianceHack(value: unknown, formValues?: Record<string, unknown>): boolean | Promise<boolean>;
}['bivarianceHack'];
```

## Examples

### Basics

Basic text input with label, placeholder, and value handling.

```tsx
import { useState } from 'react';

import { Input } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState('');

  return (
    <Input
      label="Full name"
      placeholder="Enter your full name"
      value={value}
      onChangeText={setValue}
    />
  );
}
```

### Variants

Four visual variants for the input shell: `default`, `filled`, `outline`, and `unstyled`. The variant only changes the container fill and border — label, sections, and disclaimer stay consistent.

```tsx
import { Block, Input } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Input variant="default" label="Default" placeholder="user@example.com" />
      <Input variant="filled" label="Filled" placeholder="user@example.com" />
      <Input variant="outline" label="Outline" placeholder="user@example.com" />
      <Input variant="unstyled" placeholder="Unstyled — type to edit inline" />
    </Block>
  );
}
```

### Types

Set `type` to switch the keyboard and browser behaviour — email, password, number, and tel are all supported.

```tsx
import { Block, Input } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Input type="email" label="Email address" placeholder="user@example.com" />
      <Input type="password" label="Password" placeholder="Enter your password" />
      <Input type="number" label="Age" placeholder="Enter your age" />
      <Input type="tel" label="Phone number" placeholder="+1 (555) 123-4567" />
    </Block>
  );
}
```

### Validation

Pass `error` to show a validation message, `required` to mark the field, and `helperText` for guidance. `disabled` blocks editing.

```tsx
import { useState } from 'react';

import { Block, Input } from '@plocks/ui';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function Demo() {
  const [email, setEmail] = useState('');

  return (
    <Block fullWidth>
      <Input
        type="email"
        label="Email address"
        placeholder="user@example.com"
        value={email}
        onChangeText={setEmail}
        required
        error={email.length > 0 && !isValidEmail(email) ? 'Please enter a valid email address' : undefined}
        helperText="We'll never share your email"
      />

      <Input label="Disabled" value="Cannot edit this value" disabled />
    </Block>
  );
}
```

### Multiline Modes

Pair `multiline` with `minLines`/`maxLines` to auto-expand, or with `numberOfLines` for a fixed height.

```tsx
import { useState } from 'react';

import { Block, Input } from '@plocks/ui';

export function Demo() {
  const [autoText, setAutoText] = useState('');
  const [fixedText, setFixedText] = useState('');

  return (
    <Block fullWidth>
      <Input
        label="Auto-expanding"
        placeholder="Start typing — press Enter to add lines"
        value={autoText}
        onChangeText={setAutoText}
        multiline
        minLines={1}
        maxLines={5}
        helperText="Grows from 1 to 5 lines, then scrolls"
      />

      <Input
        label="Fixed height"
        placeholder="Always 3 lines tall"
        value={fixedText}
        onChangeText={setFixedText}
        multiline
        numberOfLines={3}
      />
    </Block>
  );
}
```

### Sections and slot styling

Render content inside the field with `startSection` / `endSection`, and add `clearable` for a dismiss button. `startSectionProps` and `endSectionProps` accept any `<View>` props (including `style`) and apply them to the slot wrapper; `placeholderTextColor` overrides the muted default.

```tsx
import { useState } from 'react';

import { Block, Icon, Input, Text } from '@plocks/ui';

export function Demo() {
  const [workspace, setWorkspace] = useState('');
  const [search, setSearch] = useState('');

  return (
    <Block fullWidth>
      <Input
        label="URL"
        placeholder="my-workspace"
        value={workspace}
        onChangeText={setWorkspace}
        startSection={<Text ff="monospace" c="muted">https://</Text>}
        startSectionProps={{ style: { paddingRight: 8 } }}
      />

      <Input
        label="Search"
        placeholder="Find anything…"
        value={search}
        onChangeText={setSearch}
        clearable
        placeholderTextColor="#a855f7"
        startSection={<Icon name="search" size={16} />}
        startSectionProps={{ style: { paddingRight: 8 } }}
      />
    </Block>
  );
}
```
