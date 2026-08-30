# PinInput

A specialized input component designed for entering PIN codes, one-time passwords (OTP), verification codes, and other sequential character inputs. The component provides an intuitive interface with automatic focus management.

## Metadata

- Canonical name: `PinInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { PinInput } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: input
- Tags: pin, otp, security, input, verification
- Docs: https://react-ui-library.com/components/PinInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/PinInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `length` | number | No | 4 | Number of PIN digits |
| `keyboardFocusId` | string | No |  | Stable id used by KeyboardManager to restore focus |
| `value` | string | No |  | PIN value (controlled) |
| `defaultValue` | string | No | '' | Uncontrolled initial value (used when `value` is not provided) |
| `onChange` | (pin: string) => void | No |  | Change handler |
| `mask` | boolean | No | false | Whether to mask PIN |
| `maskChar` | string | No | '•' | Character to use for masking |
| `manageFocus` | boolean | No | true | Whether to focus next input automatically |
| `enforceOrderInitialOnly` | boolean | No |  | Enforce sequential entry (forces focus to first empty). If false, user can edit any position after complete |
| `type` | 'alphanumeric' \| 'numeric' | No | 'numeric' | Type of input |
| `placeholder` | string | No | '' | Placeholder for each input |
| `allowPaste` | boolean | No | true | Whether to allow paste |
| `oneTimeCode` | boolean | No | false | One-time code auto-complete |
| `spacing` | number | No | 8 | Input spacing |
| `borderRadius` | number | No |  | Input border radius |
| `onComplete` | (pin: string) => void | No |  | Complete handler - called when all digits are filled |
| `textInputProps` | Omit<TextInputProps, keyof BaseInputProps> | No |  | Additional TextInput props for each input |
| `autoCapitalize` | RNTextInputProps['autoCapitalize'] | No |  | Text auto-capitalization behavior |
| `autoCorrect` | boolean | No |  | Whether to enable auto-correct |
| `autoFocus` | boolean | No |  | Whether to auto-focus on first input on mount |
| `selectTextOnFocus` | boolean | No |  | Select all text on focus |
| `textContentType` | RNTextInputProps['textContentType'] | No |  | iOS text content type for autofill |
| `textAlign` | RNTextInputProps['textAlign'] | No |  | Text alignment |
| `spellCheck` | boolean | No |  | Whether spell check is enabled |
| `selectionColor` | string | No |  | Color of the text selection handles and highlight |
| `showSoftInputOnFocus` | boolean | No |  | Whether to show the soft keyboard on focus |
| `variant` | InputVariant | No |  | Visual variant of the input. `default` (light surface + border), `filled` (gray fill, no border), `outline` (transparent fill, border only), `unstyled` (no border, no fill). |
| `label` | React.ReactNode | No |  | Input label (string or component) |
| `disabled` | boolean | No | false | Whether input is disabled |
| `required` | boolean | No |  | Whether input is required |
| `error` | string | No |  | Error message |
| `helperText` | string | No |  | Helper text |
| `description` | string | No |  | Optional short description displayed directly under the label (above the field) |
| `size` | SizeValue | No | 'md' | Input size |
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
ID: `PinInput.basic` • Tags: basic, pin, code • Category: usage • Status: stable • Since: 1.0.0

Controlled 4-digit PIN input with automatic focus handoff and live preview.

```tsx
const [value, setValue] = useState('');
  return (
    <PinInput
      value={value}
      onChange={setValue}
      label="PIN code"
      keyboardFocusId="pin-demo-basic"
    />
  );
}
```

### Types
ID: `PinInput.types` • Tags: types, numeric, alphanumeric • Category: usage • Status: stable • Since: 1.0.0

Contrast numeric-only PIN entry with an alphanumeric option for recovery codes.

```tsx
const [numericValue, setNumericValue] = useState('');
  const [alphanumericValue, setAlphanumericValue] = useState('');
  return (
    <Block>
      <Text weight="semibold">PIN input types</Text>
      <Block>
        <Text size="sm" weight="semibold">
          Numeric (default)
        </Text>
        <Text size="sm" color="secondary">
          Restricts entry to digits 0-9 for PIN and OTP flows.
        </Text>
        <PinInput
          value={numericValue}
          onChange={setNumericValue}
          type="numeric"
          label="Numeric PIN"
        />
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          Alphanumeric
        </Text>
        <Text size="sm" color="secondary">
          Allow letters and numbers for recovery or backup codes.
        </Text>
        <PinInput
          value={alphanumericValue}
          onChange={setAlphanumericValue}
          type="alphanumeric"
          label="Alphanumeric code"
          length={6}
        />
      </Block>
    </Block>
  );
}
```

### Sizes
ID: `PinInput.sizes` • Tags: sizes, scale, responsive • Category: styling • Status: stable • Since: 1.0.0

Demonstrates xs through lg PIN inputs and when each token fits best.

```tsx
type SizeToken = 'xs' | 'sm' | 'md' | 'lg';
  const [xsValue, setXsValue] = useState('');
  const [smValue, setSmValue] = useState('');
  const [mdValue, setMdValue] = useState('');
  const [lgValue, setLgValue] = useState('');
  const sizeExamples: Array<{
    id: SizeToken;
    label: string;
    helper: string;
    size: SizeToken;
    value: string;
    setValue: (value: string) => void;
  }> = [
    {
      id: 'xs',
      label: 'Extra small (xs)',
      helper: 'Use for dense layouts or compact verification prompts.',
      size: 'xs',
      value: xsValue,
      setValue: setXsValue,
    },
    {
      id: 'sm',
      label: 'Small (sm)',
      helper: 'Pairs well with mobile forms and inline flows.',
      size: 'sm',
      value: smValue,
      setValue: setSmValue,
    },
    {
      id: 'md',
      label: 'Medium (md)',
      helper: 'Default size for most experiences.',
      size: 'md',
      value: mdValue,
      setValue: setMdValue,
    },
    {
      id: 'lg',
      label: 'Large (lg)',
      helper: 'Highlight critical actions with spacious fields.',
      size: 'lg',
      value: lgValue,
      setValue: setLgValue,
    },
  ];
  return (
    <Block>
      <Text weight="semibold">PIN input sizes</Text>
      {sizeExamples.map((example) => (
        <Block key={example.id}>
          <Text size="sm" weight="semibold">
            {example.label}
          </Text>
          <Text size="sm" color="secondary">
            {example.helper}
          </Text>
          <PinInput
            value={example.value}
            onChange={example.setValue}
            size={example.size}
            label={`${example.label} PIN`}
          />
        </Block>
      ))}
    </Block>
  );
}
```

### Lengths
ID: `PinInput.lengths` • Tags: length, digits, fields • Category: usage • Status: stable • Since: 1.0.0

Compare 4, 6, and 8-digit PIN inputs tailored for common authentication flows.

```tsx
const [fourDigit, setFourDigit] = useState('');
  const [sixDigit, setSixDigit] = useState('');
  const [eightDigit, setEightDigit] = useState('');
  const lengthExamples = [
    {
      length: 4,
      title: '4-digit PIN (default)',
      helper: 'Common for ATM and device security codes.',
      label: '4-digit PIN',
      value: fourDigit,
      setValue: setFourDigit,
    },
    {
      length: 6,
      title: '6-digit verification',
      helper: 'Typical for SMS-based one-time codes.',
      label: 'Verification code',
      value: sixDigit,
      setValue: setSixDigit,
    },
    {
      length: 8,
      title: '8-digit code',
      helper: 'Use for longer recovery or backup codes.',
      label: 'Security code',
      value: eightDigit,
      setValue: setEightDigit,
    },
  ];
  return (
    <Block>
      <Text weight="semibold">PIN input lengths</Text>
      {lengthExamples.map((example) => (
        <Block key={example.length}>
          <Text size="sm" weight="semibold">
            {example.title}
          </Text>
          <Text size="sm" color="secondary">
            {example.helper}
          </Text>
          <PinInput
            value={example.value}
            onChange={example.setValue}
            length={example.length}
            label={example.label}
          />
        </Block>
      ))}
    </Block>
  );
}
```

### Security
ID: `PinInput.security` • Tags: security, mask, validation, otp • Category: usage • Status: stable • Since: 1.0.0

Highlights masking, automatic OTP completion, and validation flows with inline messaging.

```tsx
const [maskedValue, setMaskedValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [validationValue, setValidationValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const correctPin = '1234';
  const handleValidate = () => {
    if (validationValue !== correctPin) {
      setError('Incorrect PIN. Try again.');
      setValidationMessage('');
      return;
    }
    setError('');
    setValidationMessage('PIN verified successfully.');
  };
  const handleOtpComplete = (value: string) => {
    setOtpStatus(`OTP entered: ${value}`);
  };
  const handleToggleDisabled = () => {
    setDisabled((prev) => !prev);
    setError('');
    setValidationMessage('');
  };
  const handleClear = () => {
    setValidationValue('');
    setError('');
    setValidationMessage('');
  };
  return (
    <Block>
      <Text weight="semibold">Security-focused PIN inputs</Text>
      <Block>
        <Text size="sm" weight="semibold">
          Masked PIN input
        </Text>
        <Text size="sm" color="secondary">
          Conceal characters as they are typed.
        </Text>
        <PinInput
          value={maskedValue}
          onChange={setMaskedValue}
          mask
          label="Secure PIN"
        />
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          OTP with auto-complete
        </Text>
        <Text size="sm" color="secondary">
          Automatically completes once all digits are entered.
        </Text>
        <PinInput
          value={otpValue}
          onChange={(value) => {
            setOtpValue(value);
            if (otpStatus) setOtpStatus('');
          }}
          onComplete={handleOtpComplete}
          oneTimeCode
          length={6}
          label="One-time password"
        />
        {otpStatus ? (
          <Text size="xs" color="secondary">
            {otpStatus}
          </Text>
        ) : null}
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          PIN validation state
        </Text>
        <Text size="sm" color="secondary">
          Enter the correct PIN: 1234
        </Text>
        <PinInput
          value={validationValue}
          onChange={(newValue) => {
            setValidationValue(newValue);
            if (error) setError('');
            if (validationMessage) setValidationMessage('');
          }}
          label="Enter PIN"
          error={error}
          disabled={disabled}
          helperText={!error ? 'Enter the correct 4-digit PIN' : undefined}
        />
        <Row gap="sm" wrap="wrap">
          <Button
            variant="filled"
            onPress={handleValidate}
            disabled={validationValue.length !== 4}
          >
            Validate
          </Button>
          <Button variant="outline" onPress={handleToggleDisabled}>
            {disabled ? 'Enable input' : 'Disable input'}
          </Button>
          <Button variant="outline" onPress={handleClear}>
            Clear
          </Button>
        </Row>
        {validationMessage ? (
          <Text size="xs" color="secondary">
            {validationMessage}
          </Text>
        ) : null}
      </Block>
    </Block>
  );
}
```
