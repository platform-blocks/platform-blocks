# TimePicker

Inline panel for selecting a time with hour/minute (and optional seconds) precision, rendered directly in the page rather than in a dialog — the time counterpart to `MonthPicker` and `YearPicker`. Supports 12-hour or 24-hour clocks, a meridiem column on 12-hour clocks, and custom step intervals for minutes and seconds. Works in controlled and uncontrolled modes.

For a form field that displays the selected time and opens this panel in a dialog, use [`TimePickerInput`](/components/TimePickerInput).

## Metadata

- Canonical name: `TimePicker`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { TimePicker } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: dates
- Docs: https://react-ui-library.com/components/TimePicker
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/TimePicker

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | TimePickerValue \| null | No |  |  |
| `defaultValue` | TimePickerValue \| null | No |  |  |
| `onChange` | (next: TimePickerValue) => void | No |  | Fired on every column selection. |
| `onChangeComplete` | (next: TimePickerValue) => void | No |  | Fired when the user picks from the last meaningful column — minutes, or seconds when `withSeconds` is set. `TimePickerInput` uses this to drive `autoClose`. |
| `format` | 12 \| 24 | No |  |  |
| `withSeconds` | boolean | No |  |  |
| `minuteStep` | number | No |  |  |
| `secondStep` | number | No |  |  |
| `columnWidth` | number | No |  | Width of each scroll column (hours/minutes/seconds). |
| `columnHeight` | number | No |  | Max height of each scroll column. |
| `disabled` | boolean | No |  |  |
| `style` | any | No |  |  |

## Examples

### Basic
ID: `TimePicker.basic` • Category: general

Basic controlled usage of the inline TimePicker panel with 24-hour format.

```tsx
const [value, setValue] = useState<TimePickerValue>({ hours: 13, minutes: 30 });
  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;
  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} />
      <Text size="sm" color="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
```

### Format 12h
ID: `TimePicker.format-12h` • Category: general

Using 12-hour clock format with AM/PM toggle.

```tsx
const [value, setValue] = useState<TimePickerValue>({ hours: 0, minutes: 15 });
  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;
  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} format={12} />
      <Text size="sm" color="secondary">
        {`Internal (24h): ${formatted}`}
      </Text>
    </Block>
  );
}
```

### With Seconds
ID: `TimePicker.with-seconds` • Category: general

Including seconds selection in the TimePicker panel.

```tsx
const [value, setValue] = useState<TimePickerValue>({ hours: 9, minutes: 5, seconds: 30 });
  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}:${String(value.seconds || 0).padStart(2, '0')}`;
  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} withSeconds />
      <Text size="sm" color="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
```
