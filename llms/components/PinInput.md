# PinInput

PinInput provides a sequence of fields for entering a PIN or verification code.

## Metadata

- Import: `import { PinInput } from '@plocks/ui';`
- Tags: pin, otp, security, input, verification
- Docs: https://plocks.dev/components/PinInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/PinInput

## Props

- `length`: number = 4 — Number of cells. Default 4.
- `value`: string — PIN value (controlled).
- `defaultValue`: string = '' — Initial value (uncontrolled).
- `onChange`: (pin: string) => void — Called with the whole PIN on every change.
- `onComplete`: (pin: string) => void — Called once when the PIN becomes complete (all cells filled) — not again on re-renders; again only after it was incomplete in between or a digit changed.
- `mask`: boolean = false — Mask the characters.
- `maskChar`: string = '•' — Character shown for a masked cell. Default `'•'`.
- `manageFocus`: boolean = true — Move focus to the next cell as each character is typed. Default true.
- `enforceOrderInitialOnly`: boolean = false — Sequential entry (focusing a later cell jumps back to the first empty one) is always enforced by default. With `enforceOrderInitialOnly`, it only applies until the PIN has been complete once; after that any cell can be edited directly.
- `type`: 'alphanumeric' | 'numeric' = 'numeric' — Accepted characters. Default `'numeric'`.
- `placeholder`: string = '' — Placeholder shown in each empty cell.
- `allowPaste`: boolean = true — Allow pasting a whole code into a cell. Default true.
- `oneTimeCode`: boolean = false — Offer SMS one-time-code autofill.
- `spacing`: number = 8 — Gap between cells (px). Default 8.
- `textInputProps`: Omit< TextInputProps, 'value' | 'defaultValue' | 'onChangeText' | 'onFocus' | 'onBlur' | 'style' | 'testID' | 'placeholder' | 'editable' > — Extra TextInput props for every cell.
- `autoCapitalize`: TextInputProps['autoCapitalize'] — Text auto-capitalization behavior.
- `autoCorrect`: boolean — Whether to enable auto-correct.
- `autoFocus`: boolean — Focus the first cell on mount.
- `selectTextOnFocus`: boolean — Select a cell's text on focus. Default true.
- `textContentType`: TextInputProps['textContentType'] — iOS text content type for autofill.
- `textAlign`: TextInputProps['textAlign'] = 'center' — Text alignment inside each cell. Default centered.
- `spellCheck`: boolean — Whether spell check is enabled.
- `selectionColor`: string — Color of the selection handles and highlight.
- `showSoftInputOnFocus`: boolean — Show the soft keyboard on focus.
- `id`: string — Base id: the cell group gets it, the label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Controlled 4-digit PIN input with automatic focus handoff between cells.

```tsx
import { useState } from 'react';
import { PinInput } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState('');

  return <PinInput value={value} onChange={setValue} label="PIN code" />;
}
```

### Types

Contrast numeric-only PIN entry with an alphanumeric option for recovery codes.

```tsx
import { Block, PinInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <PinInput type="numeric" label="Numeric" />
      <PinInput type="alphanumeric" label="Alphanumeric" />
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on PinInput.

```tsx
import { Column, PinInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <PinInput key={variant} variant={variant} label={`${variant} variant`} />
      ))}
    </Column>
  );
}
```

### Sizes

Compare the `size` prop from `xs` through `lg`.

```tsx
import { Block, PinInput } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

export function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <PinInput key={size} size={size} label={size} />
      ))}
    </Block>
  );
}
```

### Lengths

Compare 4, 6, and 8-digit PIN inputs tailored for common authentication flows.

```tsx
import { Block, PinInput } from '@plocks/ui';

const LENGTHS = [4, 6, 8];

export function Demo() {
  return (
    <Block>
      {LENGTHS.map((length) => (
        <PinInput key={length} length={length} label={`${length} digits`} />
      ))}
    </Block>
  );
}
```

### Security

Conceal digits with `mask`, offer SMS code autofill with `oneTimeCode`, and show inline validation messages through `error`.

```tsx
import { Block, PinInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <PinInput mask defaultValue="1234" label="Masked" />
      <PinInput oneTimeCode length={6} label="One-time code" />
      <PinInput defaultValue="1289" error="Incorrect PIN. Try again." label="Validation" />
    </Block>
  );
}
```
