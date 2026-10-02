# MiniCalendar

A compact calendar component for displaying a month view with selectable dates.

## Metadata

- Import: `import { MiniCalendar } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Docs: https://plocks.dev/components/MiniCalendar
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/MiniCalendar

## Props

- `value`: Date | null — Value
- `onChange`: (date: Date | null) => void
- `defaultValue`: Date | null
- `numberOfDays`: number = 7 — Days shown in the strip. Default `7`.
- `defaultDate`: Date
- `minDate`: Date — Constraints
- `maxDate`: Date
- `nextControlProps`: MiniCalendarControlProps — Extra props for the "next days" control (label, testID, style, ...).
- `previousControlProps`: MiniCalendarControlProps — Extra props for the "previous days" control (label, testID, style, ...).
- `getDayProps`: (date: Date) => Partial<DayProps> — Customization
- `renderDay`: (date: Date) => React.ReactNode
- `locale`: string = 'en-US' — Localization
- `size`: SizeValue = 'md'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Compact calendar showing a week view with date selection.

```tsx
import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { MiniCalendar } from '@plocks/dates';

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={7}
      />
      <Text size="sm" c="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Custom Day Count

MiniCalendar with configurable number of days displayed.

```tsx
import React, { useState } from 'react';
import { Block, Button, Row, Text } from '@plocks/ui';
import { MiniCalendar } from '@plocks/dates';

const DAY_OPTIONS = [3, 5, 7];

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [numberOfDays, setNumberOfDays] = useState(5);

  return (
    <Block fullWidth>
      <Row gap="xs">
        {DAY_OPTIONS.map((days) => (
          <Button
            key={days}
            size="sm"
            variant={numberOfDays === days ? 'filled' : 'outline'}
            onPress={() => setNumberOfDays(days)}
          >
            {days} days
          </Button>
        ))}
      </Row>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={numberOfDays}
      />
      <Text size="sm" c="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Date Constraints

MiniCalendar with minimum and maximum date restrictions.

```tsx
import React, { useMemo, useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { MiniCalendar } from '@plocks/dates';

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return { minDate: today, maxDate: nextWeek };
  }, []);

  return (
    <Block fullWidth>
      <MiniCalendar
        value={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        numberOfDays={7}
        minDate={minDate}
        maxDate={maxDate}
      />
      <Text size="sm" c="secondary">
        {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
      </Text>
      <Text size="xs" c="secondary">
        Only the next seven days are enabled
      </Text>
    </Block>
  );
}
```
