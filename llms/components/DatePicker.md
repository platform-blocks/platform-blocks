# DatePicker

DatePicker renders an inline calendar focused on keyboard-friendly, accessible selection flows.

## Metadata

- Import: `import { DatePicker } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Docs: https://plocks.dev/components/DatePicker
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/DatePicker

## Props

- `value`: CalendarValue — Selected value; type depends on `type` prop
- `defaultValue`: CalendarValue — Initial value for uncontrolled usage
- `onChange`: (value: CalendarValue) => void — Called when value changes
- `type`: 'single' | 'multiple' | 'range' = 'single' — Selection behavior
- `calendarProps`: Partial<CoreCalendarProps> — Pass-through customization for underlying Calendar
- `accessibilityLabel`: string — Accessible name of the inline calendar, exposed as a `group` around it (every day stays individually reachable by screen readers).
- `accessibilityHint`: string — Extra description of the inline calendar (native `accessibilityHint`).
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

`import { Month, Day } from '@plocks/dates';`

### Month

- `month` (required): Date
- `value`: CalendarValue — Selection
- `onChange`: (value: CalendarValue) => void
- `type`: 'single' | 'multiple' | 'range'
- `hoveredDate`: Date | null
- `onDayHover`: (date: Date) => void
- `onDayHoverEnd`: () => void
- `minDate`: Date — Constraints
- `maxDate`: Date
- `excludeDate`: (date: Date) => boolean
- `firstDayOfWeek`: number — Display
- `weekendDays`: number[]
- `hideOutsideDates`: boolean
- `hideWeekdays`: boolean
- `highlightToday`: boolean
- `withCellSpacing`: boolean
- `getDayProps`: (date: Date) => Partial<DayProps> — Customization
- `renderDay`: (date: Date) => React.ReactNode
- `size`: SizeValue
- `locale`: string
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Day

- `date` (required): Date
- `selected`: boolean — States
- `inRange`: boolean
- `firstInRange`: boolean
- `lastInRange`: boolean
- `previewed`: boolean
- `previewedInRange`: boolean
- `previewedFirstInRange`: boolean
- `previewedLastInRange`: boolean
- `weekend`: boolean
- `outside`: boolean
- `today`: boolean
- `disabled`: boolean
- `size`: SizeValue — Styling
- `style`: StyleProp<ViewStyle>
- `locale`: string — Locale for the cell's accessible name (the full date). Default: the runtime locale.
- `children`: React.ReactNode — Custom content

## Examples

### Basics

Standard single date selection with label and placeholder text.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <Block fullWidth>
      <DatePicker
        value={value}
        onChange={(next) => setValue(next as Date | null)}
        calendarProps={{ numberOfMonths: 1, highlightToday: true }}
      />
      <Text size="sm" c="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Date Range Picker

Select a range of dates with start and end date selection.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<[Date | null, Date | null] | null>(null);

  const start = value?.[0];
  const end = value?.[1];

  return (
    <Block fullWidth>
      <DatePicker
        type="range"
        value={value}
        onChange={(next) => setValue(next as [Date | null, Date | null] | null)}
        calendarProps={{ numberOfMonths: 2, withCellSpacing: true }}
      />
      <Text size="sm" c="secondary">
        {start && end
          ? `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
          : 'Select a start and end date'}
      </Text>
    </Block>
  );
}
```

### Date Validation

Date picker with validation rules and error handling for invalid selections.

```tsx
import React, { useMemo, useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date | null>(null);
  const [inlineError, setInlineError] = useState('');

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const handleChange = (next: Date | [Date | null, Date | null] | Date[] | null) => {
    const dateValue = next as Date | null;
    setValue(dateValue);
    setInlineError(dateValue && dateValue < today ? 'Date cannot be in the past' : '');
  };

  return (
    <Block fullWidth>
      <DatePicker
        value={value}
        onChange={handleChange}
        calendarProps={{ minDate: today, highlightToday: true }}
      />
      <Text size="sm" c={inlineError ? 'error' : 'secondary'}>
        {inlineError || 'Only dates today or later are enabled'}
      </Text>
    </Block>
  );
}
```

### Multiple Dates Selection

Select multiple independent dates for events or availability.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { DatePicker } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<Date[]>([]);

  return (
    <Block fullWidth>
      <DatePicker
        type="multiple"
        value={value}
        onChange={(next) => setValue((next as Date[]) ?? [])}
        calendarProps={{ numberOfMonths: 2, withCellSpacing: true }}
      />
      <Text size="sm" c="secondary">
        {value.length > 0
          ? value.map((date) => date.toLocaleDateString()).join(', ')
          : 'Select one or more dates'}
      </Text>
    </Block>
  );
}
```
