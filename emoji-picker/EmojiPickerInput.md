# EmojiPickerInput

EmojiPickerInput opens an emoji picker from a form field and stores the selected Unicode emoji.

## Metadata

- Import: `import { EmojiPickerInput } from '@plocks/emoji-picker';`
- Install: `npm install @plocks/emoji-picker` — a separate package from `@plocks/ui`
- Status: beta
- Tags: emoji, input, picker, form
- Docs: https://plocks.dev/components/EmojiPickerInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/emoji-picker/src/components/EmojiPickerInput

## Props

- `value`: string | null — Selected Unicode emoji. Pass null to show the placeholder.
- `defaultValue`: string | null
- `onChange`: (emoji: string | null, selection: EmojiPickerSelection | null) => void — Called on selection and when cleared; metadata is null when cleared.
- `onSelect`: (selection: EmojiPickerSelection) => void — Called only when an emoji is selected.
- `pickerProps`: Omit<EmojiPickerProps, 'onSelect'> — Props forwarded to the picker, except its selection callback.
- `closeOnSelect`: boolean = true — Close the panel after selection. @default true
- `dropdownType`: 'popover' | 'modal' = 'popover' — Desktop presentation; native and narrow screens use a sheet. @default 'popover'
- `modalTitle`: string = 'Select emoji'
- `onOpen`: () => void
- `onClose`: () => void
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Pick an emoji from the field or clear the selection.

```tsx
import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { EmojiPickerInput } from '@plocks/emoji-picker';

export function Demo() {
  const [emoji, setEmoji] = useState<string | null>(null);

  return (
    <Block gap="sm" w="100%" maw={360}>
      <EmojiPickerInput label="Reaction" placeholder="Choose an emoji" value={emoji} onChange={setEmoji} clearable />
      <Text c="muted" size="sm">Selected: {emoji ?? 'None'}</Text>
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on EmojiPickerInput.

```tsx
import { Column } from '@plocks/ui';
import { EmojiPickerInput } from '@plocks/emoji-picker';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <EmojiPickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a reaction" />
      ))}
    </Column>
  );
}
```
