# PhoneInput

The `PhoneInput` component provides a flexible way to capture telephone numbers with built-in masking and formatting.

## Metadata

- Import: `import { PhoneInput } from '@plocks/ui';`
- Tags: phone, input, mask, formatting, international
- Docs: https://plocks.dev/components/PhoneInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/PhoneInput

## Props

- `id`: string — Id of the TextInput; label/error ids derive from it. Generated when omitted.
- `value`: string — Phone number value (digits only). Omit for an uncontrolled field.
- `defaultValue`: string — Initial value while uncontrolled.
- `onChange`: (raw: string, formatted: string, meta: PhoneChangeMeta) => void — Change handler receiving (nationalDigits, formattedDisplay, meta)
- `country`: PhoneCountryCode — Country preset to format against. Controlled when provided.
- `defaultCountry`: PhoneCountryCode = 'US' — Initial country while uncontrolled. Defaults to 'US'.
- `onCountryChange`: (country: PhoneCountryCode) => void — Called when the country changes (via the picker, or `autoDetect`).
- `selectableCountry`: boolean = false — Render the dial code as a dropdown so the user can change country.
- `autoDetect`: boolean = false — Switch country when the user types or pastes an explicit `+<dial code>` prefix. Off by default: it changes the mask out from under the caller's `country` prop. The active country's own dial code is stripped either way, so pasting a full local number never truncates it. A *foreign* dial code is only stripped when `autoDetect` lets us switch to that country — otherwise the digits would be re-filed under the active country, turning `+447911123456` into `+17911123456`.
- `showCountryCode`: boolean = true — Show the dial code prefix ahead of the field
- `mask`: string — Custom mask pattern (overrides the country mask). Use '0' for digits, any other character as a literal. Avoid literal digits — see `PhoneFormat.mask`.
- `textInputProps`: ExtendedTextInputProps — Additional props forwarded to the underlying TextInput.
- `countryPickerLabel`: (countryName: string) => string = defaultCountryPickerLabel — Accessible name of the country picker button (`selectableCountry`); receives the country name.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `debounceMs` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface PhoneChangeMeta {
  /** The resolved country the value is formatted for. */
  country: PhoneCountryCode;
  /** Dial code for that country (e.g. '+1'). Empty for the international format. */
  dialCode: string;
  /** Submittable E.164 value (e.g. '+15551234567'), or '' while empty. */
  e164: string;
  /** Whether every digit the mask expects has been entered. */
  isComplete: boolean;
}

export type PhoneCountryCode =
  | 'US'
  | 'CA'
  | 'GB'
  | 'FR'
  | 'DE'
  | 'AU'
  | 'BR'
  | 'IN'
  | 'JP'
  | 'INTL'
  | (string & {});
```

## Examples

### Basics

Controlled PhoneInput example that surfaces both raw digits and the formatted display.

```tsx
import { useState } from 'react';

import { Block, PhoneInput, Text } from '@plocks/ui';

export function Demo() {
  const [raw, setRaw] = useState('');
  const [formatted, setFormatted] = useState('');

  return (
    <Block fullWidth>
      <PhoneInput
        label="Phone number"
        value={raw}
        onChange={(rawDigits, formattedDisplay) => {
          setRaw(rawDigits);
          setFormatted(formattedDisplay);
        }}
      />
      <Text size="sm">
        Raw: {raw || '—'} · Formatted: {formatted || '—'}
      </Text>
    </Block>
  );
}
```

### International

With `autoDetect`, typing or pasting a `+` dial code switches the country and mask to match. The second field uses the catch-all `country="INTL"` format instead.

```tsx
import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput
        label="Auto-detect from a + prefix"
        autoDetect
        placeholder="Try +447911123456 or +33123456789"
      />
      <PhoneInput
        label="Manual international"
        country="INTL"
        placeholder="Enter any international number"
      />
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on PhoneInput.

```tsx
import { Column, PhoneInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <PhoneInput key={variant} variant={variant} label={`${variant} variant`} placeholder="(555) 123-4567" />
      ))}
    </Column>
  );
}
```

### Country Picker

Set `selectableCountry` to turn the dial-code prefix into a country picker. Switching country remasks the digits already entered instead of clearing them.

```tsx
import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="Phone number" selectableCountry defaultValue="5551234567" />
    </Block>
  );
}
```

### Country Formats

Pass `country` to format against a built-in preset, each with its own localized mask and dial code.

```tsx
import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="United States" country="US" />
      <PhoneInput label="United Kingdom" country="GB" />
      <PhoneInput label="France" country="FR" />
      <PhoneInput label="Brazil" country="BR" />
    </Block>
  );
}
```

### Mask Visibility

Set `showCountryCode={false}` to hide the dial-code prefix; the raw digits reported by `onChange` stay the same.

```tsx
import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="With country code" />
      <PhoneInput label="Without country code" showCountryCode={false} />
    </Block>
  );
}
```

### Validation

Length-based validation for US and international formats with inline messaging.

```tsx
import { useState } from 'react';

import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  const [usRaw, setUsRaw] = useState('');
  const [internationalRaw, setInternationalRaw] = useState('');

  const isValidUs = usRaw.length === 10;
  const isValidInternational = internationalRaw.length >= 7 && internationalRaw.length <= 15;

  return (
    <Block fullWidth>
      <PhoneInput
        label="US phone (10 digits required)"
        value={usRaw}
        onChange={(raw) => setUsRaw(raw)}
        error={usRaw.length > 0 && !isValidUs ? 'Enter a 10-digit US phone number' : undefined}
      />
      <PhoneInput
        label="International phone (7-15 digits)"
        country="INTL"
        value={internationalRaw}
        onChange={(raw) => setInternationalRaw(raw)}
        error={
          internationalRaw.length > 0 && !isValidInternational
            ? 'International numbers should be 7-15 digits'
            : undefined
        }
      />
    </Block>
  );
}
```

### Advanced Masking

Custom mask patterns for international formats and extension fields.

```tsx
import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput
        label="International format"
        mask="+00 (000) 000-0000"
        showCountryCode={false}
        placeholder="+44 (791) 112-3456"
      />
      <PhoneInput
        label="North America with extension"
        mask="000-000-0000 x0000"
        showCountryCode={false}
        placeholder="555-123-4567 x1234"
      />
    </Block>
  );
}
```
