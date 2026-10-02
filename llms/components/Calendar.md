# Calendar

Calendar displays a month grid for choosing dates.

## Metadata

- Import: `import { Calendar } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Docs: https://plocks.dev/components/Calendar
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/Calendar

## Props

- `level`: 'month' | 'year' | 'decade' — View control
- `defaultLevel`: 'month' | 'year' | 'decade' = 'month'
- `onLevelChange`: (level: CalendarLevel) => void
- `date`: Date — Date management
- `defaultDate`: Date
- `onDateChange`: (date: Date) => void
- `value`: CalendarValue — Value handling (for selection)
- `onChange`: (value: CalendarValue) => void
- `type`: 'single' | 'multiple' | 'range' = 'single'
- `minDate`: Date — Constraints
- `maxDate`: Date
- `excludeDate`: (date: Date) => boolean
- `locale`: string — Locale for month / weekday names and the day cells' accessible names. Default `'en-US'`.
- `firstDayOfWeek`: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
- `weekendDays`: number[] = DEFAULT_WEEKEND_DAYS
- `withCellSpacing`: boolean — Display options
- `hideOutsideDates`: boolean = false
- `hideWeekdays`: boolean = false
- `highlightToday`: boolean = true
- `numberOfMonths`: number = 1
- `getDayProps`: (date: Date) => Partial<DayProps> — Customization
- `renderDay`: (date: Date) => React.ReactNode
- `size`: SizeValue = 'md'
- `fullWidth`: boolean = false — Stretch to fill the container instead of sizing to the day grid. Default `false`.
- `static`: boolean — Static mode: the calendar only displays — navigation, day selection, hover previews and keyboard focus are all off.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type CalendarLevel = 'month' | 'year' | 'decade';

export type CalendarValue = Date | Date[] | [Date | null, Date | null] | null;

export interface DayProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled'> {
  date: Date;

  // States
  selected?: boolean;
  inRange?: boolean;
  firstInRange?: boolean;
  lastInRange?: boolean;
  previewed?: boolean;
  previewedInRange?: boolean;
  previewedFirstInRange?: boolean;
  previewedLastInRange?: boolean;
  weekend?: boolean;
  outside?: boolean;
  today?: boolean;
  disabled?: boolean;

  // Styling
  size?: SizeValue;
  style?: StyleProp<ViewStyle>;

  /** Locale for the cell's accessible name (the full date). Default: the runtime locale. */
  locale?: string;

  // Custom content
  children?: React.ReactNode;
}
```

## Examples

### Basics

Bind `value` and `onChange` to local state to capture the selected day while `highlightToday` keeps the current date visually distinct.

```tsx
import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { Calendar } from '@plocks/dates';

const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <Block fullWidth>
      <Calendar
        value={selectedDate}
        onChange={(date) => setSelectedDate(date as Date | null)}
        highlightToday
      />
      <Text size="sm" c="secondary">
        Selected date: {selectedDate ? formatter.format(selectedDate) : 'none'}
      </Text>
    </Block>
  );
}
```

### Date constraints

Set `minDate` and `maxDate` to keep navigation inside the current month while still allowing the calendar to show surrounding weeks.

```tsx
import { useMemo, useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { Calendar } from '@plocks/dates';

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function Demo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { minDate, maxDate, monthLabel } = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { minDate: start, maxDate: end, monthLabel: monthFormatter.format(start) };
  }, []);

  return (
    <Block fullWidth>
      <Calendar
        value={selectedDate}
        onChange={(date) => setSelectedDate(date as Date | null)}
        minDate={minDate}
        maxDate={maxDate}
        highlightToday
      />
      <Text size="sm" c="secondary">
        Selected date: {selectedDate ? dateFormatter.format(selectedDate) : 'none'}
      </Text>
      <Text size="xs" c="secondary">
        Only dates in {monthLabel} are enabled.
      </Text>
    </Block>
  );
}
```

### Multiple selection

Switch `type="multiple"` to let teammates flag several event days at once; the component returns an array you can format for summaries or badges.

```tsx
import { useMemo, useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { Calendar } from '@plocks/dates';

const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

export function Demo() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const summary = useMemo(() => {
    if (selectedDates.length === 0) return 'No dates picked yet.';
    if (selectedDates.length === 1) {
      return `1 date picked: ${formatter.format(selectedDates[0])}`;
    }
    return `${selectedDates.length} dates picked: ${selectedDates.map((date) => formatter.format(date)).join(', ')}`;
  }, [selectedDates]);

  return (
    <Block fullWidth>
      <Calendar
        type="multiple"
        value={selectedDates}
        onChange={(dates) => setSelectedDates(dates as Date[])}
        highlightToday
      />
      <Text size="sm" c="secondary">
        {summary}
      </Text>
    </Block>
  );
}
```

### Range selection

Use `type="range"` to capture a start and end date for bookings or sprints; the component returns a tuple you can translate into summaries or validation.

```tsx
import { useMemo, useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { Calendar } from '@plocks/dates';

const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function Demo() {
  const [selectedRange, setSelectedRange] = useState<[Date | null, Date | null]>([null, null]);

  const summary = useMemo(() => {
    const [start, end] = selectedRange;
    if (!start) {
      return 'No dates selected yet.';
    }
    if (!end) {
      return `Start date chosen: ${formatter.format(start)} — pick an end date.`;
    }
    return `${formatter.format(start)} → ${formatter.format(end)}`;
  }, [selectedRange]);

  return (
    <Block fullWidth>
      <Calendar
        type="range"
        value={selectedRange}
        onChange={(range) => setSelectedRange(range as [Date | null, Date | null])}
        highlightToday
      />
      <Text size="sm" c="secondary">
        {summary}
      </Text>
    </Block>
  );
}
```
