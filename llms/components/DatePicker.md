# DatePicker

DatePicker renders an inline calendar focused on keyboard-friendly, accessible selection flows. Pair it with `DatePickerInput` when you need an input trigger and modal or popover calendar.

## Metadata

- Canonical name: `DatePicker`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { DatePicker } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: dates
- Docs: https://react-ui-library.com/components/DatePicker
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/DatePicker

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | CalendarValue | No |  | Selected value; type depends on `type` prop |
| `defaultValue` | CalendarValue | No |  | Initial value for uncontrolled usage |
| `onChange` | (value: CalendarValue) => void | No |  | Called when value changes |
| `type` | CalendarType | No |  | Selection behavior |
| `calendarProps` | Partial<CoreCalendarProps> | No |  | Pass-through customization for underlying Calendar |
| `style` | StyleProp<ViewStyle> | No |  | Optional container style for the inline calendar |
| `testID` | string | No |  | Test identifier |
| `accessibilityLabel` | string | No |  | Accessibility label for the inline calendar region |
| `accessibilityHint` | string | No |  | Accessibility hint for the inline calendar region |

## Examples

### Basic Date Picker
ID: `DatePicker.basic` • Tags: basic, single-date, label, placeholder • Category: general

Standard single date selection with label and placeholder text.

```tsx
const [value, setValue] = useState<Date | null>(null);
  return (
    <Block fullWidth>
      <DatePicker
        value={value}
        onChange={(next) => setValue(next as Date | null)}
        calendarProps={{ numberOfMonths: 1, highlightToday: true }}
      />
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Date Range Picker
ID: `DatePicker.range` • Tags: range, start-date, end-date, date-range • Category: general

Select a range of dates with start and end date selection.

```tsx
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
      <Text size="sm" color="secondary">
        {start && end
          ? `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
          : 'Select a start and end date'}
      </Text>
    </Block>
  );
}
```

### Date Validation
ID: `DatePicker.validation` • Tags: validation, error, rules, min-date, future-date • Category: general

Date picker with validation rules and error handling for invalid selections.

```tsx
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
      <Text size="sm" color={inlineError ? 'error' : 'secondary'}>
        {inlineError || 'Only dates today or later are enabled'}
      </Text>
    </Block>
  );
}
```

### Multiple Dates Selection
ID: `DatePicker.multiple` • Tags: multiple, independent-dates, array, events • Category: general

Select multiple independent dates for events or availability.

```tsx
const [value, setValue] = useState<Date[]>([]);
  return (
    <Block fullWidth>
      <DatePicker
        type="multiple"
        value={value}
        onChange={(next) => setValue((next as Date[]) ?? [])}
        calendarProps={{ numberOfMonths: 2, withCellSpacing: true }}
      />
      <Text size="sm" color="secondary">
        {value.length > 0
          ? value.map((date) => date.toLocaleDateString()).join(', ')
          : 'Select one or more dates'}
      </Text>
    </Block>
  );
}
```
