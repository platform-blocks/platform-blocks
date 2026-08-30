# TimePickerInput

Form field for selecting a time. Presents an input showing the formatted value and opens a [TimePicker](/components/TimePicker) panel in a dialog, mirroring the behavior of `DatePickerInput`, `MonthPickerInput` and `YearPickerInput`. Adds the field concerns the inline panel has no notion of — label, validation, clearing, and manual text entry — and supports the full `<Input>` slot-prop API.

## Metadata

- Canonical name: `TimePickerInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { TimePickerInput } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: dates
- Docs: https://react-ui-library.com/components/TimePickerInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/TimePickerInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | any | No |  | Size of the field itself; the panel columns are fixed-width. |
| `value` | TimePickerValue \| null | No |  |  |
| `defaultValue` | TimePickerValue \| null | No |  |  |
| `onChange` | (next: TimePickerValue \| null) => void | No |  | Emits `null` when the field is cleared, which the inline panel never does. |
| `allowInput` | boolean | No |  | Allow typing a time directly into the field. |
| `panelWidth` | number \| string | No |  | Width of the dialog holding the panel. |
| `inputWidth` | number \| string | No |  |  |
| `label` | string | No |  |  |
| `description` | string | No |  |  |
| `error` | string | No |  |  |
| `helperText` | string | No |  |  |
| `style` | any | No |  |  |
| `onOpen` | () => void | No |  |  |
| `onClose` | () => void | No |  |  |
| `title` | string | No |  |  |
| `autoClose` | boolean | No |  | Close the dialog as soon as the last column is picked, hiding the Done button. |
| `fullWidth` | boolean | No |  |  |
| `clearable` | boolean | No |  |  |
| `clearButtonLabel` | string | No |  |  |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field label `<Text>`. |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field description `<Text>`. |
| `placeholderTextColor` | string | No |  | Color of the placeholder text. |
| `startSectionProps` | Omit<ViewProps, 'children'> | No |  | View props applied to the wrapper around startSection. |
| `endSectionProps` | Omit<ViewProps, 'children'> | No |  | View props applied to the wrapper around endSection (the clock icon by default). |

## Examples

### Basic
ID: `TimePickerInput.basic` • Category: general

```tsx
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
      <Text size="sm" color="secondary">
        {formatted ? `Selected: ${formatted}` : 'No time selected'}
      </Text>
    </Block>
  );
}
```

### Validation
ID: `TimePickerInput.validation` • Category: general

Validation example showing custom error when outside allowed business hours (09:00-17:00).

```tsx
const withinBusiness = (v: TimePickerValue) => {
  const totalMinutes = v.hours * 60 + v.minutes;
  return totalMinutes >= 9 * 60 && totalMinutes <= 17 * 60; // 09:00 - 17:00 inclusive
};
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
        <Text size="sm" color="secondary">
          Selected: {value.hours.toString().padStart(2, '0')}:{value.minutes.toString().padStart(2, '0')}
        </Text>
      )}
    </Block>
  );
}
```
