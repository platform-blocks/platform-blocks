# DatePickerInput

DatePickerInput wraps the inline `DatePicker` in an accessible input experience. It handles focus management, modal presentation, and formatting so people can choose dates without leaving the form flow.

## Metadata

- Canonical name: `DatePickerInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { DatePickerInput } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: dates
- Docs: https://react-ui-library.com/components/DatePickerInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/DatePickerInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | CalendarValue | No |  | Selected value; type depends on `type` prop |
| `defaultValue` | CalendarValue | No |  | Initial value for uncontrolled usage |
| `onChange` | (value: CalendarValue) => void | No |  | Called when value changes |
| `type` | CalendarType | No |  | Selection behavior |
| `calendarProps` | Partial<CoreCalendarProps> | No |  | Pass-through customization for underlying Calendar |
| `placeholder` | string | No |  | Input placeholder text |
| `displayFormat` | string | No |  | Format string for displaying value in the input |
| `valueFormat` | string | No |  | Serialization/parsing format (reserved for future) |
| `clearable` | boolean | No |  | Show a clear button |
| `size` | SizeValue | No |  | Visual size |
| `disabled` | boolean | No |  | Disable interaction |
| `withAsterisk` | boolean | No |  | Show required indicator |
| `dropdownType` | 'modal' \| 'popover' | No |  | Presentation modality |
| `closeOnSelect` | boolean | No |  | Close picker after single selection (for single mode) |
| `onOpen` | () => void | No |  | Lifecycle events |
| `onClose` | () => void | No |  |  |
| `onFocus` | () => void | No |  |  |
| `onBlur` | () => void | No |  |  |
| `variant` | InputVariant | No |  | Visual variant of the input. `default` (light surface + border), `filled` (gray fill, no border), `outline` (transparent fill, border only), `unstyled` (no border, no fill). |
| `label` | React.ReactNode | No |  | Input label (string or component) |
| `required` | boolean | No |  | Whether input is required |
| `error` | string | No |  | Error message |
| `helperText` | string | No |  | Helper text |
| `description` | string | No |  | Optional short description displayed directly under the label (above the field) |
| `name` | string | No |  | Input name for form integration |
| `startSection` | React.ReactNode | No |  | Left section content |
| `endSection` | React.ReactNode | No |  | Right section content |
| `style` | any | No |  | Additional styling |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `accessibilityHint` | string | No |  | Accessibility hint |
| `testID` | string | No |  | Test ID for testing |
| `debounceMs` | number | No |  | Debounce delay for validation in milliseconds |
| `onEnter` | () => void | No |  | Enter key press handler |
| `clearButtonLabel` | string | No |  | Accessible label for the clear button |
| `onClear` | () => void | No |  | Callback when the clear button is pressed |
| `keyboardFocusId` | string | No |  | Identifier used with KeyboardManagerProvider to request refocus |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field label `<Text>` (style, weight, ff, etc.) |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field description `<Text>` |
| `placeholderTextColor` | string | No |  | Color of the placeholder text. Falls back to `theme.text.muted`. |
| `startSectionProps` | Omit<ViewProps, 'children'> | No |  | Props applied to the wrapping `<View>` around `startSection` (style, accessibility, etc.). |
| `endSectionProps` | Omit<ViewProps, 'children'> | No |  | Props applied to the wrapping `<View>` around `endSection`. |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basic
ID: `DatePickerInput.basic` • Category: general

```tsx
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
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.toLocaleDateString()}` : 'No date selected'}
      </Text>
    </Block>
  );
}
```

### Multiple
ID: `DatePickerInput.multiple` • Category: general

```tsx
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
      <Text size="sm" color="secondary">
        {value.length > 0
          ? `Selected: ${value.map((date) => date.toLocaleDateString()).join(', ')}`
          : 'Select one or more dates'}
      </Text>
    </Block>
  );
}
```

### Range
ID: `DatePickerInput.range` • Category: general

```tsx
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
      <Text size="sm" color="secondary">
        {value && value[0] && value[1]
          ? `${value[0].toLocaleDateString()} – ${value[1].toLocaleDateString()}`
          : 'Select a start and end date'}
      </Text>
    </Block>
  );
}
```

### Validation
ID: `DatePickerInput.validation` • Category: general

```tsx
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
      <Text size="sm" color="secondary">
        Past dates show the validation state
      </Text>
    </Block>
  );
}
```
