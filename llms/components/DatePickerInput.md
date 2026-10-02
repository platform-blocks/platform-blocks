# DatePickerInput

DatePickerInput opens a calendar from a form field to select a date.

## Metadata

- Import: `import { DatePickerInput } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Docs: https://plocks.dev/components/DatePickerInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/DatePickerInput

## Props

- `value`: CalendarValue — Selected value; type depends on `type` prop
- `defaultValue`: CalendarValue — Initial value for uncontrolled usage
- `onChange`: (value: CalendarValue) => void — Called when value changes
- `type`: 'single' | 'multiple' | 'range' = 'single' — Selection behavior
- `calendarProps`: Partial<CoreCalendarProps> — Pass-through customization for underlying Calendar
- `displayFormat`: string = 'MMMM d — Format string for displaying value in the input (tokens: yyyy, yy, MMMM, MMM, MM, M, dd, d).
- `dropdownType`: 'modal' | 'popover' = 'modal' — `modal` (default): a centered sheet. `popover`: a dropdown anchored to the field on desktop web (the sheet on native and small screens).
- `closeOnSelect`: boolean = true for `single` — Close the picker after a selection completes. @default true for `single`
- `modalTitle`: string — Title of the picker sheet / name of the popover. Defaults by `type` ("Select date", …).
- `onOpen`: () => void — Called when the picker opens.
- `onClose`: () => void — Called when the picker closes.
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

DatePickerInput opens a calendar from a form field to select a date.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <DatePickerInput
        value={value}
        onChange={(next) => setValue(next as Date | null)}
        placeholder="Select a date"
        label="Date"
        clearable
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on DatePickerInput.

```tsx
import { Column } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <DatePickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a date" />
      ))}
    </Column>
  );
}
```

### Multiple

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date[]>([]);

  return (
    <Block fullWidth>
      <DatePickerInput
        type="multiple"
        value={value}
        onChange={(next) => setValue((next as Date[]) || [])}
        label="Multiple dates"
        placeholder="Select dates"
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value.length > 0
          ? `Selected: ${value.map((date) => date.toLocaleDateString()).join(', ')}`
          : 'Select one or more dates'}
      </Text>
    </Block>
  );
}
```

### Range

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<[Date | null, Date | null] | null>(null);

  return (
    <Block fullWidth>
      <DatePickerInput
        type="range"
        value={value}
        onChange={(next) => setValue((next as [Date | null, Date | null]) || null)}
        label="Date range"
        placeholder="Select range"
        closeOnSelect
        fullWidth
      />
      <Text size="sm" c="secondary">
        {value && value[0] && value[1]
          ? `${value[0].toLocaleDateString()} – ${value[1].toLocaleDateString()}`
          : 'Select a start and end date'}
      </Text>
    </Block>
  );
}
```

### Validation

```tsx
import React, { useMemo, useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePickerInput } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);
  const [error, setError] = useState<string | undefined>();

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const handleChange = (next: Date | [Date | null, Date | null] | Date[] | null) => {
    const dateValue = next as Date | null;
    setValue(dateValue);

    if (dateValue && dateValue < today) {
      setError('Date cannot be in the past');
    } else {
      setError(undefined);
    }
  };

  return (
    <Block fullWidth>
      <DatePickerInput
        value={value}
        onChange={handleChange}
        placeholder="Select a future date"
        label="Future date"
        error={error}
        clearable
        fullWidth
        calendarProps={{
          minDate: today,
          highlightToday: true,
        }}
      />
      <Text size="sm" c="secondary">
        Past dates show the validation state
      </Text>
    </Block>
  );
}
```
