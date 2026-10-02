# TimePickerInput

TimePickerInput opens a time picker from a form field and displays the selected time.

## Metadata

- Import: `import { TimePickerInput } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Status: beta
- Docs: https://plocks.dev/components/TimePickerInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/TimePickerInput

## Props

- `value`: TimePickerValue | null
- `defaultValue`: TimePickerValue | null
- `onChange`: (next: TimePickerValue | null) => void — Emits `null` when the field is cleared, which the inline panel never does.
- `allowInput`: boolean = true — Allow typing a time directly into the field (`hh:mm`, `hh:mm:ss`, optional AM/PM). @default true
- `panelWidth`: number — Width of the sheet holding the panel.
- `onOpen`: () => void — Called when the panel opens.
- `onClose`: () => void — Called when the panel closes.
- `title`: string = 'Select time' — Title of the panel sheet. @default 'Select time'
- `autoClose`: boolean = false — Close the panel as soon as the last column is picked, hiding the Done button.
- `pickerButtonLabel`: string = 'Choose time' — Accessible label of the button that opens the panel. @default 'Choose time'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `TimePicker` props (`format` `withSeconds` `minuteStep` `secondStep` `columnWidth`): https://plocks.dev/llms/components/TimePicker.md

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

TimePickerInput opens a time picker from a form field and displays the selected time.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePickerInput } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue | null>({ hours: 9, minutes: 30 });

  const formatted = value
    ? `${((value.hours + 11) % 12) + 1}:${String(value.minutes).padStart(2, '0')} ${value.hours >= 12 ? 'PM' : 'AM'}`
    : null;

  return (
    <Block fullWidth>
      <TimePickerInput
        value={value}
        onChange={setValue}
        label="Meeting time"
        format={12}
        fullWidth
      />
      <Text size="sm" c="secondary">
        {formatted ? `Selected: ${formatted}` : 'No time selected'}
      </Text>
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on TimePickerInput.

```tsx
import { Column } from '@plocks/ui';
import { TimePickerInput } from '@plocks/dates';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <TimePickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a time" />
      ))}
    </Column>
  );
}
```

### Validation

Validation example showing custom error when outside allowed business hours (09:00-17:00).

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePickerInput } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

const withinBusiness = (v: TimePickerValue) => {
  const totalMinutes = v.hours * 60 + v.minutes;
  return totalMinutes >= 9 * 60 && totalMinutes <= 17 * 60; // 09:00 - 17:00 inclusive
};

export function Demo() {
  const [value, setValue] = useState<TimePickerValue | null>({ hours: 8, minutes: 45 });
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (next: TimePickerValue | null) => {
    setValue(next);
    if (!next) {
      setError(undefined);
      return;
    }

    if (!withinBusiness(next)) {
      setError('Select a time between 09:00 and 17:00');
    } else {
      setError(undefined);
    }
  };

  return (
    <Block fullWidth>
      <TimePickerInput
        value={value}
        onChange={handleChange}
        label="Meeting time"
        error={error}
        helperText="Business hours only"
        clearable
        fullWidth
      />
      {value && (
        <Text size="sm" c="secondary">
          Selected: {value.hours.toString().padStart(2, '0')}:{value.minutes.toString().padStart(2, '0')}
        </Text>
      )}
    </Block>
  );
}
```
