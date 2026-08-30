# NumberInput

The `NumberInput` component is a numeric text input field that provides built-in step controls for incrementing and decrementing the value. It supports custom formatting and parsing functions, allowing you to display numbers in various formats (e.g., currency, percentages) while maintaining a numeric value internally.

## Metadata

- Canonical name: `NumberInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { NumberInput } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: input, numeric, stepper, formatter
- Docs: https://react-ui-library.com/components/NumberInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/NumberInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | No |  | Number value |
| `onChange` | (value: number \| undefined) => void | No |  | Change handler |
| `allowDecimal` | boolean | No |  | Allow decimal values |
| `allowNegative` | boolean | No |  | Allow negative values |
| `allowLeadingZeros` | boolean | No |  | Allow leading zeros while editing |
| `allowedDecimalSeparators` | string[] | No |  | Additional characters that should be treated as decimal separators |
| `decimalSeparator` | string | No |  | Decimal separator character |
| `decimalScale` | number | No |  | Maximum number of digits after the decimal point |
| `fixedDecimalScale` | boolean | No |  | When true, pads the decimal part with trailing zeros to match decimalScale |
| `min` | number | No |  | Minimum value |
| `max` | number | No |  | Maximum value |
| `step` | number | No |  | Step increment |
| `shiftMultiplier` | number | No |  | Multiplier applied to the step when using modifier keys |
| `precision` | number | No |  | Number of decimal places |
| `thousandSeparator` | string \| boolean | No |  | Thousand separator character or boolean to enable default separator |
| `thousandsGroupStyle` | 'none' \| 'thousand' \| 'lakh' \| 'wan' | No |  | Thousand grouping strategy |
| `prefix` | string | No |  | Prefix string appended before the value when displayed |
| `suffix` | string | No |  | Suffix string appended after the value when displayed |
| `format` | 'integer' \| 'decimal' \| 'currency' \| 'percentage' | No |  | Number format |
| `currency` | string | No |  | Currency code for currency format |
| `isAllowed` | (values: { floatValue?: number; formattedValue: string; value: string }) => boolean | No |  | Optional guard executed before value is committed |
| `startValue` | number | No |  | Value applied when stepping from an empty state |
| `stepHoldDelay` | number | No |  | Delay before step-hold behaviour kicks in (ms) |
| `stepHoldInterval` | number \| ((stepCount: number) => number) | No |  | Interval or function controlling step-hold cadence |
| `withKeyboardEvents` | boolean | No |  | Enable keyboard arrow interactions |
| `withControls` | boolean | No |  | Show increment/decrement buttons |
| `withSideButtons` | boolean | No |  | Render horizontal decrement/increment buttons flanking the input |
| `hideControlsOnMobile` | boolean | No |  | Whether to hide step controls on mobile |
| `withDragGesture` | boolean | No |  | Enable press-drag gesture to adjust value |
| `dragAxis` | 'horizontal' \| 'vertical' | No |  | Axis that determines how drag gestures adjust the value |
| `dragStepDistance` | number | No |  | Pixel distance required to trigger a single step while dragging |
| `dragStepMultiplier` | number | No |  | Multiplier applied to the configured step while dragging |
| `onDragStateChange` | (isDragging: boolean) => void | No |  | Callback fired when the drag gesture activation state changes |
| `formatter` | (value: number) => string | No |  | Custom formatter function |
| `parser` | (value: string) => number | No |  | Custom parser function |
| `clampBehavior` | 'strict' \| 'blur' \| 'none' | No |  | Clamp value to min/max bounds |
| `allowEmpty` | boolean | No |  | Allow empty value |
| `textInputProps` | ExtendedTextInputProps | No |  | Additional TextInput props |
| `autoCapitalize` | RNTextInputProps['autoCapitalize'] | No |  | Text auto-capitalization behavior |
| `autoCorrect` | boolean | No |  | Whether to enable auto-correct |
| `autoFocus` | boolean | No |  | Whether to auto-focus on mount |
| `returnKeyType` | RNTextInputProps['returnKeyType'] | No |  | Return key type for soft keyboard |
| `blurOnSubmit` | boolean | No |  | Whether to blur on submit |
| `selectTextOnFocus` | boolean | No |  | Select all text on focus |
| `textContentType` | RNTextInputProps['textContentType'] | No |  | iOS text content type for autofill |
| `textAlign` | RNTextInputProps['textAlign'] | No |  | Text alignment |
| `spellCheck` | boolean | No |  | Whether spell check is enabled |
| `inputMode` | RNTextInputProps['inputMode'] | No |  | Input mode (modern alternative to keyboardType) |
| `enterKeyHint` | RNTextInputProps['enterKeyHint'] | No |  | Enter key hint |
| `selectionColor` | string | No |  | Color of the text selection handles and highlight |
| `showSoftInputOnFocus` | boolean | No |  | Whether to show the soft keyboard on focus |
| `editable` | boolean | No |  | Whether the field is editable |
| `variant` | InputVariant | No |  | Visual variant of the input. `default` (light surface + border), `filled` (gray fill, no border), `outline` (transparent fill, border only), `unstyled` (no border, no fill). |
| `label` | React.ReactNode | No |  | Input label (string or component) |
| `disabled` | boolean | No |  | Whether input is disabled |
| `required` | boolean | No |  | Whether input is required |
| `placeholder` | string | No |  | Input placeholder |
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
| `clearable` | boolean | No |  | Show built-in clear button when input has value |
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
ID: `NumberInput.basic` • Tags: basic, numeric, step • Category: usage • Status: stable • Since: 1.0.0

Controlled number input with simple step controls and live value preview.

```tsx
const [quantity, setQuantity] = useState<number | undefined>(2);
  return (
    <NumberInput
      label="Quantity"
      placeholder="Enter amount"
      value={quantity}
      onChange={setQuantity}
      min={0}
      step={1}
    />
  );
}
```

### Formats
ID: `NumberInput.formats` • Tags: currency, percent, formatting • Category: usage • Status: stable • Since: 1.0.0

Showcases currency formatting, percentage suffixes, and a derived total.

```tsx
const [price, setPrice] = useState<number | undefined>(249.99);
  const [discount, setDiscount] = useState<number | undefined>(10);
  const finalPrice = price != null && discount != null
    ? price * (1 - discount / 100)
    : undefined;
  return (
    <Block>
      <Block>
        <NumberInput
          label="List price"
          value={price}
          onChange={setPrice}
          format="currency"
          currency="USD"
          fixedDecimalScale
          decimalScale={2}
          min={0}
          allowNegative={false}
        />
        <NumberInput
          label="Discount"
          value={discount}
          onChange={setDiscount}
          suffix="%"
          min={0}
          max={100}
          step={0.5}
          allowDecimal
        />
      </Block>
      <Text size="xs" color="secondary">
        Final price: {finalPrice != null ? `$${finalPrice.toFixed(2)}` : '—'}
      </Text>
    </Block>
  );
}
```

### Side buttons
ID: `NumberInput.side-buttons` • Tags: controls, step, buttons • Category: interaction • Status: stable • Since: 1.0.0

Side button controls with shift multipliers for both fine and coarse adjustments.

```tsx
const EnhancedNumberInput = NumberInput as any;
  const [value, setValue] = useState(32);
  const [step, setStep] = useState(1);
  const effectiveStep = useMemo(() => step || 1, [step]);
  return (
    <Block style={{ maxWidth: 360 }}>
      <Text weight="semibold">Side buttons and shift multiplier</Text>
      <Text size="sm" color="secondary">
        Combine side buttons with the default controls to support coarse and fine adjustments.
      </Text>
      <Block>
        <EnhancedNumberInput
          label="Playback speed"
          value={value}
          min={0}
          max={200}
          step={effectiveStep}
          shiftMultiplier={10}
          suffix="%"
          withSideButtons
          withControls
          onChange={(next: number | undefined) => {
            if (typeof next === 'number') {
              setValue(next);
            }
          }}
        />
        <Row justify="space-between" align="center">
          <Text size="xs" color="secondary">
            Current speed: {value}%
          </Text>
          <Text size="xs" color="secondary">
            Shift-click = ±{effectiveStep * 10}
          </Text>
        </Row>
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          Adjust the base step
        </Text>
        <Text size="sm" color="secondary">
          Update the increment to see how the multiplier scales.
        </Text>
        <EnhancedNumberInput
          label="Base step"
          value={step}
          min={1}
          max={25}
          step={1}
          withSideButtons
          onChange={(next: number | undefined) => {
            if (typeof next === 'number') {
              setStep(next);
            }
          }}
        />
      </Block>
    </Block>
  );
}
```

### Drag gesture
ID: `NumberInput.drag-gesture` • Tags: drag, gesture, adjustment • Category: interaction • Status: stable • Since: 1.0.0

Press-and-drag interactions for horizontal and vertical number adjustments.

```tsx
const [horizontalValue, setHorizontalValue] = useState<number | undefined>(32);
  const [verticalValue, setVerticalValue] = useState<number | undefined>(120);
  const [dragging, setDragging] = useState(false);
  const handleDragStateChange = (state: boolean) => {
    setDragging(state);
  };
  return (
    <Block>
      <Text weight="semibold">Press-and-drag adjustment</Text>
      <Text size="sm" color="secondary">
        Drag across the input to nudge values without lifting your pointer. The status below reflects the current drag state.
      </Text>
      <Text size="xs" color={dragging ? 'primary' : 'secondary'}>
        Dragging: {dragging ? 'active' : 'idle'}
      </Text>
      <Block>
        <Block>
          <Text size="sm" weight="semibold">
            Horizontal drag
          </Text>
          <Text size="sm" color="secondary">
            Step every 14px drag movement with a multiplier for faster adjustments.
          </Text>
          <NumberInput
            label="Temperature"
            value={horizontalValue}
            onChange={setHorizontalValue}
            withDragGesture
            dragAxis="horizontal"
            dragStepDistance={14}
            dragStepMultiplier={2}
            step={1}
            allowDecimal={false}
            min={0}
            suffix=" °C"
            onDragStateChange={handleDragStateChange}
          />
        </Block>
        <Block>
          <Text size="sm" weight="semibold">
            Vertical drag
          </Text>
          <Text size="sm" color="secondary">
            Drag up or down to adjust between 0 and 200 with built-in controls.
          </Text>
          <NumberInput
            label="Light intensity"
            value={verticalValue}
            onChange={setVerticalValue}
            withDragGesture
            dragAxis="vertical"
            dragStepDistance={18}
            step={5}
            allowDecimal={false}
            min={0}
            max={200}
            withControls
            hideControlsOnMobile={false}
            onDragStateChange={handleDragStateChange}
          />
        </Block>
      </Block>
    </Block>
  );
}
```
