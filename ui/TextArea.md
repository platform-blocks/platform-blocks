# TextArea

The TextArea component provides a multi-line text input with support for auto-resizing, character counting, validation states, and flexible sizing options.

## Metadata

- Import: `import { TextArea } from '@plocks/ui';`
- Tags: input, textarea, multiline, text, form, validation
- Docs: https://plocks.dev/components/TextArea
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/TextArea

## Props

- `id`: string — Id of the TextInput; label/error ids derive from it. Generated when omitted.
- `rows`: number — Number of visible text rows (default 3).
- `minRows`: number — Minimum number of rows while `autoResize` is on.
- `maxRows`: number — Maximum number of rows while `autoResize` is on (then it scrolls).
- `autoResize`: boolean — Grow and shrink with the content, between `minRows` and `maxRows`.
- `maxLength`: number — Character limit
- `showCharCounter`: boolean — Show a `count/maxLength` counter under the field (needs `maxLength`).
- `h`: number — Fixed height of the text box in px (overrides `rows`). Sizes the box, not the root.
- `resize`: 'none' | 'vertical' | 'horizontal' | 'both' — Whether the user may resize the field (web only; CSS `resize`). Default `'none'`.
- `textInputProps`: ExtendedTextInputProps — Additional TextInput props
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
- `enterKeyHint`: RNTextInputProps['enterKeyHint'] — Enter key hint
- `selectionColor`: string — Color of the text selection handles and highlight
- `showSoftInputOnFocus`: boolean — Whether to show the soft keyboard on focus
- `editable`: boolean — Passthrough to the TextInput. Prefer `readOnly`; `editable={false}` behaves the same.
- `scrollEnabled`: boolean — Whether the text scrolls inside the field (defaults to `!autoResize`).
- `w`: DimensionProp — Width
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`value` `defaultValue` `onChangeText` `placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

A controlled `TextArea` with a `label` and `description`; `rows` sets how many lines it shows before scrolling.

```tsx
import { useState } from 'react';

import { Block, TextArea } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState('');

  return (
    <Block fullWidth>
      <TextArea
        label="Message"
        placeholder="Enter your message"
        value={value}
        onChangeText={setValue}
        description="Provide helpful context for your request."
        rows={4}
        fullWidth
      />
    </Block>
  );
}
```

### Features

Showcases auto-resize, character counting, validation, disabled, and required helper scenarios.

```tsx
import { useState } from 'react';

import { Block, TextArea } from '@plocks/ui';

export function Demo() {
  const [autoResizeValue, setAutoResizeValue] = useState(
    'Type more text to see auto-resize in action...\n\nAdd multiple lines to watch the text area grow and shrink with content.'
  );
  const [counterValue, setCounterValue] = useState('');
  const [errorValue, setErrorValue] = useState('');

  return (
    <Block fullWidth>
      <TextArea
        label="Auto-resize message"
        placeholder="Adjusts height between two and six rows based on content."
        value={autoResizeValue}
        onChangeText={setAutoResizeValue}
        autoResize
        minRows={2}
        maxRows={6}
        fullWidth
      />

      <TextArea
        label="Support message"
        placeholder="Type to see the counter (max 100 characters)"
        value={counterValue}
        onChangeText={setCounterValue}
        maxLength={100}
        showCharCounter
        rows={3}
        fullWidth
      />

      <TextArea
        label="Required response"
        placeholder="This field cannot be empty"
        value={errorValue}
        onChangeText={setErrorValue}
        error={errorValue.length > 0 ? undefined : 'A response is required before submission.'}
        required
        rows={3}
        fullWidth
      />

      <TextArea
        label="Disabled text area"
        placeholder="Disabled state"
        value="This text area is disabled and cannot be edited."
        disabled
        rows={2}
        fullWidth
      />

      <TextArea
        label="Required with helper"
        placeholder="Add details"
        required
        rows={2}
        helperText="Required fields display an asterisk and supporting guidance."
        fullWidth
      />
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on TextArea.

```tsx
import { Column, TextArea } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <TextArea key={variant} variant={variant} label={`${variant} variant`} placeholder="Write a note" rows={2} />
      ))}
    </Column>
  );
}
```

### Sizes

Walks the full `size` scale, `xs` through `3xl`, so the field matches the surrounding form density.

```tsx
import { Block, Text, TextArea } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" c="secondary">{size}</Text>
          <TextArea size={size} rows={3} placeholder="Write a message" fullWidth />
        </Block>
      ))}
    </Block>
  );
}
```

### Validation

Validate on submit and pass the message to `error`: it replaces the `helperText` and marks the field invalid until the user edits it again.

```tsx
import { useState } from 'react';

import { Block, Button, TextArea } from '@plocks/ui';

export function Demo() {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!feedback.trim()) {
      setError('Feedback is required.');
    } else if (feedback.trim().length < 10) {
      setError('Feedback must be at least 10 characters.');
    }
  };

  return (
    <Block fullWidth>
      <TextArea
        label="Feedback"
        placeholder="Share your thoughts (minimum 10 characters)"
        value={feedback}
        onChangeText={(value) => {
          setFeedback(value);
          setError(undefined);
        }}
        error={error}
        required
        rows={4}
        helperText="Tell us what went well and what could improve."
        fullWidth
      />
      <Button variant="filled" onPress={handleSubmit}>
        Submit feedback
      </Button>
    </Block>
  );
}
```
