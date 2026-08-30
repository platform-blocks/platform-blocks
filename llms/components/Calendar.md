# Calendar

A versatile calendar component for selecting dates, months, and years with customizable styles and behaviors.

## Metadata

- Canonical name: `Calendar`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Calendar } from '@platform-blocks/react-ui-library';`
- Category: dates
- Docs: https://react-ui-library.com/components/Calendar
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Calendar

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `level` | CalendarLevel | No |  | View control |
| `defaultLevel` | CalendarLevel | No | 'month' |  |
| `onLevelChange` | (level: CalendarLevel) => void | No |  |  |
| `date` | Date | No |  | Date management |
| `defaultDate` | Date | No |  |  |
| `onDateChange` | (date: Date) => void | No |  |  |
| `value` | CalendarValue | No |  | Value handling (for selection) |
| `onChange` | (value: CalendarValue) => void | No |  |  |
| `type` | CalendarType | No | 'single' |  |
| `minDate` | Date | No |  | Constraints |
| `maxDate` | Date | No |  |  |
| `excludeDate` | (date: Date) => boolean | No |  |  |
| `locale` | string | No |  | Localization |
| `firstDayOfWeek` | 0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 | No | 0 |  |
| `weekendDays` | number[] | No | [0, 6] |  |
| `withCellSpacing` | boolean | No |  | Display options |
| `hideOutsideDates` | boolean | No | false |  |
| `hideWeekdays` | boolean | No | false |  |
| `highlightToday` | boolean | No | true |  |
| `numberOfMonths` | number | No | 1 |  |
| `getDayProps` | (date: Date) => Partial<DayProps> | No |  | Customization |
| `renderDay` | (date: Date) => React.ReactNode | No |  |  |
| `size` | SizeValue | No | 'md' |  |
| `fullWidth` | boolean | No | false | Stretch to fill the container instead of sizing to the day grid. Default `false`. |
| `static` | boolean | No |  | Static mode (non-interactive) |

## Examples

### Basic selection
ID: `Calendar.basic` • Tags: single, selection • Category: basics • Status: stable • Since: 0.3.0

Bind `value` and `onChange` to local state to capture the selected day while `highlightToday` keeps the current date visually distinct.

```tsx
const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  return (
    <Block fullWidth>
      <Calendar
        value={selectedDate}
        onChange={(date) => setSelectedDate(date as Date | null)}
        highlightToday
      />
      <Text size="sm" color="secondary">
        Selected date: {selectedDate ? formatter.format(selectedDate) : 'none'}
      </Text>
    </Block>
  );
}
```

### Date constraints
ID: `Calendar.constrained` • Tags: min-date, max-date • Category: rules • Status: stable • Since: 0.3.0

Set `minDate` and `maxDate` to keep navigation inside the current month while still allowing the calendar to show surrounding weeks.

```tsx
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
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
      <Text size="sm" color="secondary">
        Selected date: {selectedDate ? dateFormatter.format(selectedDate) : 'none'}
      </Text>
      <Text size="xs" color="secondary">
        Only dates in {monthLabel} are enabled.
      </Text>
    </Block>
  );
}
```

### Multiple selection
ID: `Calendar.multiple` • Tags: multiple, events • Category: selection • Status: stable • Since: 0.3.0

Switch `type="multiple"` to let teammates flag several event days at once; the component returns an array you can format for summaries or badges.

```tsx
const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
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
      <Text size="sm" color="secondary">
        {summary}
      </Text>
    </Block>
  );
}
```

### Range selection
ID: `Calendar.range` • Tags: range, bookings • Category: selection • Status: stable • Since: 0.3.0

Use `type="range"` to capture a start and end date for bookings or sprints; the component returns a tuple you can translate into summaries or validation.

```tsx
const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
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
      <Text size="sm" color="secondary">
        {summary}
      </Text>
    </Block>
  );
}
```
