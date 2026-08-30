# YearPickerInput

Input component that opens `YearPicker` inside a modal dialog. Ideal for settings where only the year matters (fiscal periods, graduation year, etc.) while keeping the UI aligned with the rest of our picker inputs.

## Metadata

- Canonical name: `YearPickerInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { YearPickerInput } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: dates
- Docs: https://react-ui-library.com/components/YearPickerInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/YearPickerInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | Date \| null | No |  | Controlled value for the selected year |
| `defaultValue` | Date \| null | No |  | Default year when uncontrolled |
| `onChange` | (value: Date \| null) => void | No |  | Called when the year selection changes |
| `formatValue` | (value: Date) => string | No |  | Custom formatter for the input value |
| `placeholder` | string | No |  | Placeholder text when no year is selected |
| `clearable` | boolean | No |  | Show a clear button when a year is selected |
| `closeOnSelect` | boolean | No |  | Close the picker after selecting a year |
| `yearPickerProps` | Partial<Omit<YearPickerProps, 'value'>> | No |  | Additional props forwarded to YearPicker (except value) |
| `modalTitle` | string | No |  | Dialog title text |
| `onOpen` | () => void | No |  | Called when the picker dialog opens |
| `onClose` | () => void | No |  | Called when the picker dialog closes |
| `variant` | InputVariant | No |  | Visual variant of the input. `default` (light surface + border), `filled` (gray fill, no border), `outline` (transparent fill, border only), `unstyled` (no border, no fill). |
| `label` | React.ReactNode | No |  | Input label (string or component) |
| `disabled` | boolean | No |  | Whether input is disabled |
| `required` | boolean | No |  | Whether input is required |
| `error` | string | No |  | Error message |
| `helperText` | string | No |  | Helper text |
| `description` | string | No |  | Optional short description displayed directly under the label (above the field) |
| `size` | SizeValue | No |  | Input size |
| `withAsterisk` | boolean | No |  | Whether to show required indicator |
| `name` | string | No |  | Input name for form integration |
| `startSection` | React.ReactNode | No |  | Left section content |
| `endSection` | React.ReactNode | No |  | Right section content |
| `style` | any | No |  | Additional styling |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `accessibilityHint` | string | No |  | Accessibility hint |
| `testID` | string | No |  | Test ID for testing |
| `debounceMs` | number | No |  | Debounce delay for validation in milliseconds |
| `onFocus` | () => void | No |  | Focus handler |
| `onBlur` | () => void | No |  | Blur handler |
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
ID: `YearPickerInput.basic` • Category: general

```tsx
const [value, setValue] = useState<Date | null>(null);
  return (
    <Block fullWidth>
      <YearPickerInput
        value={value}
        onChange={setValue}
        label="Fiscal year"
        placeholder="Select a year"
        clearable
        fullWidth
      />
      <Text size="sm" color="secondary">
        {value ? `Selected: ${value.getFullYear()}` : 'No year selected'}
      </Text>
    </Block>
  );
}
```
