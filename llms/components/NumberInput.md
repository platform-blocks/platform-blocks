# NumberInput

NumberInput provides a numeric field with step controls and optional formatting.

## Metadata

- Import: `import { NumberInput } from '@plocks/ui';`
- Tags: input, numeric, stepper, formatter
- Docs: https://plocks.dev/components/NumberInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/NumberInput

## Props

- `id`: string — Id of the TextInput; label/error ids derive from it. Generated when omitted.
- `value`: number — Controlled value. Passing the prop at all (even `undefined`, meaning "empty") makes the field controlled; omit it and use `defaultValue` for an uncontrolled field.
- `defaultValue`: number — Initial value while uncontrolled.
- `onChange`: (value: number | undefined) => void — Called with the new number, or `undefined` when the field is cleared.
- `allowDecimal`: boolean — Allow decimal values
- `allowNegative`: boolean = true — Allow negative values
- `allowLeadingZeros`: boolean = true — Allow leading zeros while editing
- `allowedDecimalSeparators`: string[] — Additional characters that should be treated as decimal separators
- `decimalSeparator`: string = DEFAULT_DECIMAL_SEPARATOR — Decimal separator character
- `decimalScale`: number — Maximum number of digits after the decimal point
- `fixedDecimalScale`: boolean = false — When true, pads the decimal part with trailing zeros to match decimalScale
- `min`: number — Minimum value
- `max`: number — Maximum value
- `step`: number = 1 — Step increment
- `shiftMultiplier`: number = 10 — Multiplier applied to the step when using modifier keys
- `precision`: number — Number of decimal places
- `thousandSeparator`: string | boolean — Thousand separator character or boolean to enable default separator
- `thousandsGroupStyle`: 'none' | 'thousand' | 'lakh' | 'wan' = 'thousand' — Thousand grouping strategy
- `prefix`: string — Prefix string appended before the value when displayed
- `suffix`: string — Suffix string appended after the value when displayed
- `format`: 'integer' | 'decimal' | 'currency' | 'percentage' = 'decimal' — Number format
- `currency`: string = 'USD' — Currency code for currency format
- `isAllowed`: (values: { floatValue?: number; formattedValue: string; value: string }) => boolean — Optional guard executed before value is committed
- `startValue`: number = 0 — Value applied when stepping from an empty state
- `stepHoldDelay`: number = DEFAULT_STEP_DELAY — Delay before step-hold behaviour kicks in (ms)
- `stepHoldInterval`: number | ((stepCount: number) => number) = DEFAULT_STEP_INTERVAL — Interval or function controlling step-hold cadence
- `withKeyboardEvents`: boolean = true — ArrowUp / ArrowDown step the value (Shift multiplies by `shiftMultiplier`). Default true.
- `withControls`: boolean = false — Show increment/decrement buttons
- `withSideButtons`: boolean = false — Render horizontal decrement/increment buttons flanking the input
- `hideControlsOnMobile`: boolean = true — Whether to hide step controls on mobile
- `withDragGesture`: boolean = false — Enable press-drag gesture to adjust value
- `dragAxis`: 'horizontal' | 'vertical' = 'horizontal' — Axis that determines how drag gestures adjust the value
- `dragStepDistance`: number = DEFAULT_DRAG_STEP_DISTANCE — Pixel distance required to trigger a single step while dragging
- `dragStepMultiplier`: number = 1 — Multiplier applied to the configured step while dragging
- `onDragStateChange`: (isDragging: boolean) => void — Callback fired when the drag gesture activation state changes
- `formatter`: (value: number) => string — Custom formatter function
- `parser`: (value: string) => number — Custom parser function
- `clampBehavior`: 'strict' | 'blur' | 'none' = 'blur' — Clamp value to min/max bounds
- `allowEmpty`: boolean = true — Allow empty value
- `textInputProps`: ExtendedTextInputProps — Additional TextInput props
- `autoCapitalize`: RNTextInputProps['autoCapitalize'] — Text auto-capitalization behavior
- `autoCorrect`: boolean — Whether to enable auto-correct
- `autoFocus`: boolean — Whether to auto-focus on mount
- `returnKeyType`: RNTextInputProps['returnKeyType'] — Return key type for soft keyboard
- `blurOnSubmit`: boolean — Whether to blur on submit
- `selectTextOnFocus`: boolean — Select all text on focus
- `textContentType`: RNTextInputProps['textContentType'] — iOS text content type for autofill
- `textAlign`: RNTextInputProps['textAlign'] — Text alignment
- `spellCheck`: boolean — Whether spell check is enabled
- `inputMode`: RNTextInputProps['inputMode'] — Input mode (modern alternative to keyboardType)
- `enterKeyHint`: RNTextInputProps['enterKeyHint'] — Enter key hint
- `selectionColor`: string — Color of the text selection handles and highlight
- `showSoftInputOnFocus`: boolean — Whether to show the soft keyboard on focus
- `editable`: boolean — Passthrough to the TextInput. Prefer `readOnly`; `editable={false}` behaves the same.
- `incrementLabel`: string = 'Increase value' — Accessible names of the step buttons.
- `decrementLabel`: string = 'Decrease value'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `debounceMs` `onEnter` `startSection` `endSection` `startSectionProps` `endSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Keep the number in state with `value` and `onChange`; `min` stops it from going below zero.

```tsx
import { useState } from 'react';
import { NumberInput } from '@plocks/ui';

export function Demo() {
  const [quantity, setQuantity] = useState<number | undefined>(2);

  return (
    <NumberInput
      label="Quantity"
      placeholder="Enter amount"
      value={quantity}
      onChange={setQuantity}
      min={0}
    />
  );
}
```

### Formats

Set `format` to `currency` or `percentage` to show the currency symbol or percent sign once the field loses focus; `decimalScale` with `fixedDecimalScale` pins the decimal places.

```tsx
import { Block, NumberInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <NumberInput
        label="List price"
        defaultValue={249.99}
        format="currency"
        decimalScale={2}
        fixedDecimalScale
      />
      <NumberInput
        label="Discount"
        defaultValue={10}
        format="percentage"
      />
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on NumberInput.

```tsx
import { Column, NumberInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <NumberInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Enter a quantity" />
      ))}
    </Column>
  );
}
```

### Side buttons

`withSideButtons` puts decrement and increment buttons on either side of the field. Hold Shift while pressing to step by `shiftMultiplier` (10 by default) for coarse adjustments.

```tsx
import { NumberInput } from '@plocks/ui';

export function Demo() {
  return (
    <NumberInput
      label="Playback speed"
      defaultValue={32}
      min={0}
      max={200}
      suffix="%"
      withSideButtons
    />
  );
}
```

### Drag gesture

Add `withDragGesture` to change the value by pressing and dragging across the field; `dragAxis` picks horizontal or vertical movement.

```tsx
import { Block, NumberInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <NumberInput
        label="Horizontal drag"
        defaultValue={32}
        withDragGesture
        dragAxis="horizontal"
      />
      <NumberInput
        label="Vertical drag"
        defaultValue={120}
        withDragGesture
        dragAxis="vertical"
      />
    </Block>
  );
}
```
