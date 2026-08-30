# Input

A versatile text input component that provides a consistent interface for text entry across different platforms. The Input component supports various types, validation states, and accessibility features.

## Metadata

- Canonical name: `Input`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Input } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: input
- Tags: input, form, text, validation
- Docs: https://react-ui-library.com/components/Input
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Input

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | 'text' \| 'password' \| 'email' \| 'tel' \| 'number' \| 'search' | No | 'text' | Input type - determines styling and behavior |
| `validation` | ValidationRule[] | No |  | Input validation rules |
| `autoComplete` | 'off' \| 'password' \| 'email' \| 'tel' \| 'url' \| 'name' \| 'additional-name' \| 'address-line1' \| 'address-line2' \| 'birthdate-day' \| 'birthdate-full' \| 'birthdate-month' \| 'birthdate-year' \| 'cc-csc' \| 'cc-exp' \| 'cc-exp-month' \| 'cc-exp-year' \| 'cc-number' \| 'country' \| 'current-password' \| 'family-name' \| 'given-name' \| 'honorific-prefix' \| 'honorific-suffix' \| 'new-password' \| 'one-time-code' \| 'organization' \| 'organization-title' \| 'postal-code' \| 'street-address' \| 'username' | No |  | Auto-complete type |
| `keyboardType` | KeyboardTypeOptions | No |  | Keyboard type for mobile |
| `multiline` | boolean | No |  | Whether input is multiline |
| `numberOfLines` | number | No |  | Number of lines for multiline input |
| `minLines` | number | No | 1 | Minimum number of lines for multiline input (default: 1) |
| `maxLines` | number | No |  | Maximum number of lines for multiline input |
| `maxLength` | number | No |  | Maximum length |
| `secureTextEntry` | boolean | No |  | Whether to secure text entry |
| `textInputProps` | ExtendedTextInputProps | No |  | Additional TextInput props |
| `inputRef` | React.Ref<any> | No |  | Ref to underlying TextInput (focus control) |
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
| `enterKeyHint` | RNTextInputProps['enterKeyHint'] | No |  | Hint for the enter key |
| `selectionColor` | string | No |  | Color of the text selection handles and highlight |
| `showSoftInputOnFocus` | boolean | No |  | Whether to show the soft keyboard on focus |
| `editable` | boolean | No |  | Whether the field is read-only (alias for !editable) |
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
ID: `Input.basic` • Tags: basic, input, text • Category: basics • Status: stable • Since: 1.0.0

Basic text input with label, placeholder, and value handling.

```tsx
const [value, setValue] = useState('');
  return (
    <Input
      label="Full name"
      placeholder="Enter your full name"
      value={value}
      onChangeText={setValue}
    />
  );
}
```

### Variants
ID: `Input.variants` • Tags: variants, filled, outline, unstyled • Category: basics • Status: stable • Since: 1.0.0

Four visual variants for the input shell: `default`, `filled`, `outline`, and `unstyled`. The variant only changes the container fill and border — label, sections, and disclaimer stay consistent.

```tsx
return (
    <Block>
      <Input variant="default" label="Default" placeholder="user@example.com" />
      <Input variant="filled" label="Filled" placeholder="user@example.com" />
      <Input variant="outline" label="Outline" placeholder="user@example.com" />
      <Input variant="unstyled" placeholder="Unstyled — type to edit inline" />
    </Block>
  );
}
```

### Types
ID: `Input.types` • Tags: types, email, password, number, tel • Category: usage • Status: stable • Since: 1.0.0

Set `type` to switch the keyboard and browser behaviour — email, password, number, and tel are all supported.

```tsx
return (
    <Block>
      <Input type="email" label="Email address" placeholder="user@example.com" />
      <Input type="password" label="Password" placeholder="Enter your password" />
      <Input type="number" label="Age" placeholder="Enter your age" />
      <Input type="tel" label="Phone number" placeholder="+1 (555) 123-4567" />
    </Block>
  );
}
```

### Validation
ID: `Input.validation` • Tags: validation, error, required, helper • Category: usage • Status: stable • Since: 1.0.0

Pass `error` to show a validation message, `required` to mark the field, and `helperText` for guidance. `disabled` blocks editing.

```tsx
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [email, setEmail] = useState('');
  return (
    <Block>
      <Input
        type="email"
        label="Email address"
        placeholder="user@example.com"
        value={email}
        onChangeText={setEmail}
        required
        error={email.length > 0 && !isValidEmail(email) ? 'Please enter a valid email address' : undefined}
        helperText="We'll never share your email"
      />
      <Input label="Disabled" value="Cannot edit this value" disabled />
    </Block>
  );
}
```

### Multiline Modes
ID: `Input.multiline` • Tags: input, multiline • Category: behavior • Status: stable • Since: 1.0.0

Pair `multiline` with `minLines`/`maxLines` to auto-expand, or with `numberOfLines` for a fixed height.

```tsx
const [autoText, setAutoText] = useState('');
  const [fixedText, setFixedText] = useState('');
  return (
    <Block>
      <Input
        label="Auto-expanding"
        placeholder="Start typing — press Enter to add lines"
        value={autoText}
        onChangeText={setAutoText}
        multiline
        minLines={1}
        maxLines={5}
        helperText="Grows from 1 to 5 lines, then scrolls"
      />
      <Input
        label="Fixed height"
        placeholder="Always 3 lines tall"
        value={fixedText}
        onChangeText={setFixedText}
        multiline
        numberOfLines={3}
      />
    </Block>
  );
}
```

### Sections and slot styling
ID: `Input.slot-styling` • Tags: startSection, endSection, clearable, placeholderTextColor, slot-props, customization • Category: usage • Status: stable • Since: 1.0.0

Render content inside the field with `startSection` / `endSection`, and add `clearable` for a dismiss button. `startSectionProps` and `endSectionProps` accept any `<View>` props (including `style`) and apply them to the slot wrapper; `placeholderTextColor` overrides the muted default.

```tsx
const [workspace, setWorkspace] = useState('');
  const [search, setSearch] = useState('');
  return (
    <Block>
      <Input
        label="URL"
        placeholder="my-workspace"
        value={workspace}
        onChangeText={setWorkspace}
        startSection={<Text ff="monospace" color="muted">https://</Text>}
        startSectionProps={{ style: { paddingRight: 8 } }}
      />
      <Input
        label="Search"
        placeholder="Find anything…"
        value={search}
        onChangeText={setSearch}
        clearable
        placeholderTextColor="#a855f7"
        startSection={<Icon name="search" size={16} />}
        startSectionProps={{ style: { paddingRight: 8 } }}
      />
    </Block>
  );
}
```
