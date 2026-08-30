# TextArea

The TextArea component provides a multi-line text input with support for auto-resizing, character counting, validation states, and flexible sizing options.

## Metadata

- Canonical name: `TextArea`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { TextArea } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: input, textarea, multiline, text, form, validation
- Docs: https://react-ui-library.com/components/TextArea
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/TextArea

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `defaultValue` | string | No |  | Default value for uncontrolled mode |
| `rows` | number | No |  | Number of rows (height) for the textarea |
| `minRows` | number | No |  | Minimum number of rows |
| `maxRows` | number | No |  | Maximum number of rows |
| `autoResize` | boolean | No |  | Whether to automatically resize based on content |
| `maxLength` | number | No |  | Character limit |
| `showCharCounter` | boolean | No |  | Show character counter |
| `h` | number | No |  | Fixed height for the TextArea |
| `resize` | 'none' \| 'vertical' \| 'horizontal' \| 'both' | No |  | Resize behavior |
| `textInputProps` | Omit<TextInputProps, keyof BaseInputProps> | No |  | Additional TextInput props |
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
| `scrollEnabled` | boolean | No |  | Whether scroll is enabled (multiline) |
| `variant` | InputVariant | No |  | Visual variant of the input. `default` (light surface + border), `filled` (gray fill, no border), `outline` (transparent fill, border only), `unstyled` (no border, no fill). |
| `value` | string | No |  | Input value |
| `onChangeText` | (text: string) => void | No |  | Change handler |
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
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basic
ID: `TextArea.basic` • Tags: basic, multiline, textarea • Category: usage • Status: stable • Since: 1.0.0

Controlled text area with helper copy and inline character count feedback.

```tsx
const [value, setValue] = useState('');
  return (
    <Block fullWidth>
      <TextArea
        label="Message"
        placeholder="Enter your message"
        value={value}
        onChangeText={setValue}
        description="Provide helpful context for your request."
        error={value.length > 120 ? 'Message is too long. Keep it under 120 characters.' : undefined}
        rows={4}
        fullWidth
      />
      {value ? (
        <Text size="xs" color="secondary">
          Character count: {value.length}
        </Text>
      ) : null}
    </Block>
  );
}
```

### Features
ID: `TextArea.features` • Tags: features, counter, resize, autoresize • Category: features • Status: stable • Since: 1.0.0

Showcases auto-resize, character counting, validation, disabled, and required helper scenarios.

```tsx
const [autoResizeValue, setAutoResizeValue] = useState(
    'Type more text to see auto-resize in action...\n\nAdd multiple lines to watch the text area grow and shrink with content.'
  );
  const [counterValue, setCounterValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  return (
    <Block fullWidth>
        <TextArea
          label="Auto-resize message"
          placeholder="Adjusts height between two and six rows based on content."
          value={autoResizeValue}
          onChangeText={setAutoResizeValue}
          autoResize
          minRows={2}
          maxRows={6}
          fullWidth
        />
      <Block>
        <Text size="sm" weight="semibold">
          Character counter
        </Text>
        <Text size="sm" color="secondary">
          Enforces a maximum length while surfacing a live counter.
        </Text>
        <TextArea
          label="Support message"
          placeholder="Type to see the counter (max 100 characters)"
          value={counterValue}
          onChangeText={setCounterValue}
          maxLength={100}
          showCharCounter
          rows={3}
          helperText="Helpful for concise feedback or short-form inputs."
          fullWidth
        />
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          Error and required states
        </Text>
        <Text size="sm" color="secondary">
          Show validation messaging when the field is empty.
        </Text>
        <TextArea
          label="Required response"
          placeholder="This field cannot be empty"
          value={errorValue}
          onChangeText={setErrorValue}
          error={errorValue.length > 0 ? undefined : 'A response is required before submission.'}
          required
          rows={3}
          fullWidth
        />
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          Disabled field
        </Text>
        <Text size="sm" color="secondary">
          Communicates when editing is not allowed.
        </Text>
        <TextArea
          label="Disabled text area"
          placeholder="Disabled state"
          value="This text area is disabled and cannot be edited."
          disabled
          rows={2}
          fullWidth
        />
      </Block>
      <Block>
        <Text size="sm" weight="semibold">
          Required helper copy
        </Text>
        <Text size="sm" color="secondary">
          Pair helper text with the required badge to give extra guidance.
        </Text>
        <TextArea
          label="Required with helper"
          placeholder="Add details"
          required
          rows={2}
          helperText="Required fields display an asterisk and supporting guidance."
          fullWidth
        />
      </Block>
    </Block>
  );
}
```

### Sizes
ID: `TextArea.sizes` • Tags: sizes, dimensions, height • Category: styling • Status: stable • Since: 1.0.0

Walks the full `size` scale, `xs` through `3xl`, so the field matches the surrounding form density.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" color="secondary">{size}</Text>
          <TextArea size={size} rows={3} placeholder="Write a message" fullWidth />
        </Block>
      ))}
    </Block>
  );
}
```

### Validation
ID: `TextArea.validation` • Tags: validation, error, required, feedback • Category: states • Status: stable • Since: 1.0.0

Demonstrates required validation, length limits, inline success messaging, and error summaries.

```tsx
type ValidationErrors = {
  feedback?: string;
  message?: string;
};
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState('');
  const validateForm = () => {
    const nextErrors: ValidationErrors = {};
    if (!feedback.trim()) {
      nextErrors.feedback = 'Feedback is required.';
    } else if (feedback.trim().length < 10) {
      nextErrors.feedback = 'Feedback must be at least 10 characters.';
    }
    if (message.length > 500) {
      nextErrors.message = 'Message cannot exceed 500 characters.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleSubmit = () => {
    if (validateForm()) {
      setStatus('Feedback submitted successfully.');
      return;
    }
    setStatus('');
  };
  return (
    <Block fullWidth>
      <Block>
        <Text size="sm" weight="semibold">
          Required feedback
        </Text>
        <Text size="sm" color="secondary">
          Must include at least ten characters before the form can submit.
        </Text>
        <TextArea
          label="Feedback"
          placeholder="Share your thoughts (minimum 10 characters)"
          value={feedback}
          onChangeText={(value) => {
            setFeedback(value);
            if (errors.feedback) {
              setErrors((prev) => ({ ...prev, feedback: undefined }));
            }
          }}
          error={errors.feedback}
          required
          rows={4}
          helperText="Tell us what went well and what could improve."
          fullWidth
        />
      </Block>
      <Button variant="filled" onPress={handleSubmit}>
        Submit feedback
      </Button>
      {status ? (
        <Text size="xs" color="success">
          {status}
        </Text>
      ) : null}
      {Object.keys(errors).length > 0 && (
        <Block
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            padding: 12,
          }}
        >
          <Text size="sm" weight="semibold" color="error">
            Please fix the following before submitting:
          </Text>
          {Object.values(errors)
            .filter(Boolean)
            .map((errorMessage) => (
              <Text key={errorMessage} size="xs" color="error">
                • {errorMessage}
              </Text>
            ))}
        </Block>
      )}
    </Block>
  );
}
```
