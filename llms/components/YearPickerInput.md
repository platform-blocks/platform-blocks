# YearPickerInput

YearPickerInput opens a year picker from a form field.

## Metadata

- Import: `import { YearPickerInput } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Status: beta
- Docs: https://plocks.dev/components/YearPickerInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/YearPickerInput

## Props

- `value`: Date | null — Controlled value for the selected year
- `defaultValue`: Date | null — Default year when uncontrolled
- `onChange`: (value: Date | null) => void — Called when the year selection changes
- `formatValue`: (value: Date) => string = defaultFormat — Custom formatter for the input value
- `closeOnSelect`: boolean = true — Close the picker after selecting a year
- `yearPickerProps`: Partial<Omit<YearPickerProps, 'value'>> — Additional props forwarded to YearPicker (except value)
- `dropdownType`: 'modal' | 'popover' = 'modal' — `modal` (default): a centered sheet. `popover`: a dropdown anchored to the field on desktop web (the sheet on native and small screens).
- `modalTitle`: string = 'Select year' — Title of the picker sheet / name of the popover.
- `onOpen`: () => void — Called when the picker opens
- `onClose`: () => void — Called when the picker closes
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

YearPickerInput opens a year picker from a form field.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { YearPickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <YearPickerInput
        value={value}
        onChange={setValue}
        label="Fiscal year"
        placeholder="Select a year"
        clearable
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on YearPickerInput.

```tsx
import { Column } from '@plocks/ui';
import { YearPickerInput } from '@plocks/dates';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <YearPickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a year" />
      ))}
    </Column>
  );
}
```
