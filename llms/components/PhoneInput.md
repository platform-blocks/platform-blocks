# PhoneInput

The `PhoneInput` component provides a flexible way to capture telephone numbers with built-in masking and formatting.

## Metadata

- Canonical name: `PhoneInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { PhoneInput } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: phone, input, mask, formatting, international
- Docs: https://react-ui-library.com/components/PhoneInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/PhoneInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | No |  | Phone number value (digits only). Omit for an uncontrolled field. |
| `defaultValue` | string | No |  | Initial value while uncontrolled. |
| `onChange` | (raw: string, formatted: string, meta: PhoneChangeMeta) => void | No |  | Change handler receiving (nationalDigits, formattedDisplay, meta) |
| `country` | PhoneCountryCode | No |  | Country preset to format against. Controlled when provided. |
| `defaultCountry` | PhoneCountryCode | No | 'US' | Initial country while uncontrolled. Defaults to 'US'. |
| `onCountryChange` | (country: PhoneCountryCode) => void | No |  | Called when the country changes (via the picker, or `autoDetect`). |
| `selectableCountry` | boolean | No | false | Render the dial code as a dropdown so the user can change country. |
| `autoDetect` | boolean | No | false | Switch country when the user types or pastes an explicit `+<dial code>` prefix. Off by default: it changes the mask out from under the caller's `country` prop. The active country's own dial code is stripped either way, so pasting a full local number never truncates it. A *foreign* dial code is only stripped when `autoDetect` lets us switch to that country — otherwise the digits would be re-filed under the active country, turning `+447911123456` into `+17911123456`. |
| `showCountryCode` | boolean | No | true | Show the dial code prefix ahead of the field |
| `mask` | string | No |  | Custom mask pattern (overrides the country mask). Use '0' for digits, any other character as a literal. Avoid literal digits — see `PhoneFormat.mask`. |
| `textInputProps` | ExtendedTextInputProps | No |  | Additional props forwarded to the underlying TextInput. |
| `variant` | InputVariant | No |  | Visual variant of the input. `default` (light surface + border), `filled` (gray fill, no border), `outline` (transparent fill, border only), `unstyled` (no border, no fill). |
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
ID: `PhoneInput.basic` • Tags: basic, phone, input • Category: basics • Status: experimental • Since: 1.0.0

Controlled PhoneInput example that surfaces both raw digits and the formatted display.

```tsx
const [raw, setRaw] = useState('');
  const [formatted, setFormatted] = useState('');
  const [e164, setE164] = useState('');
  const [complete, setComplete] = useState(false);
  return (
    <Block fullWidth>
      <Text weight="semibold">Basic phone input</Text>
      <Text size="sm" color="secondary">
        Controlled phone field showing the raw national digits, the formatted display
        value, and the submittable E.164 form.
      </Text>
      <PhoneInput
        label="Phone number"
        value={raw}
        onChange={(rawDigits, formattedDisplay, meta) => {
          setRaw(rawDigits);
          setFormatted(formattedDisplay);
          setE164(meta.e164);
          setComplete(meta.isComplete);
        }}
        country="US"
        showCountryCode
      />
      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Current values
          </Text>
          <Code size="sm">{JSON.stringify({ raw, formatted, e164, complete }, null, 2)}</Code>
        </Block>
      </Card>
    </Block>
  );
}
```

### International
ID: `PhoneInput.international` • Tags: international, auto-detect, phone • Category: features • Status: experimental • Since: 1.0.0

Compare auto-detected formats with a manual international configuration.

```tsx
const [autoDetectValue, setAutoDetectValue] = useState('');
  const [autoDetectE164, setAutoDetectE164] = useState('');
  const [autoDetectCountry, setAutoDetectCountry] = useState('US');
  const [intlValue, setIntlValue] = useState('');
  const [intlFormatted, setIntlFormatted] = useState('');
  return (
    <Block fullWidth>
      <Text weight="semibold">International detection</Text>
      <Text size="sm" color="secondary">
        With autoDetect, an explicit + prefix picks the country: type or paste
        +447911123456 and the mask, dial code and E.164 output follow along. A
        recognized dial code is stripped on paste either way, so a full international
        number never overflows the national mask.
      </Text>
      <Block>
        <PhoneInput
          label="Auto-detect from a + prefix"
          value={autoDetectValue}
          onChange={(raw, _formatted, meta) => {
            setAutoDetectValue(raw);
            setAutoDetectE164(meta.e164);
          }}
          defaultCountry="US"
          onCountryChange={setAutoDetectCountry}
          autoDetect
          showCountryCode
          placeholder="Try +447911123456 or +33123456789"
        />
        <PhoneInput
          label="Manual international"
          country="INTL"
          value={intlValue}
          onChange={(raw, formatted) => {
            setIntlValue(raw);
            setIntlFormatted(formatted);
          }}
          showCountryCode={false}
          placeholder="Enter any international number"
        />
      </Block>
      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Values
          </Text>
          <Code size="sm">
            {JSON.stringify(
              {
                autoDetect: {
                  country: autoDetectCountry,
                  raw: autoDetectValue,
                  e164: autoDetectE164
                },
                international: { raw: intlValue, formatted: intlFormatted }
              },
              null,
              2
            )}
          </Code>
        </Block>
      </Card>
    </Block>
  );
}
```

### Country Picker
ID: `PhoneInput.country-select` • Tags: country, picker, dial-code, phone • Category: features • Status: experimental • Since: 1.0.0

Let the user pick the country from the dial-code prefix, remasking the number in place.

```tsx
const [country, setCountry] = useState('US');
  const [raw, setRaw] = useState('');
  const [e164, setE164] = useState('');
  return (
    <Block fullWidth>
      <Text weight="semibold">Country picker</Text>
      <Text size="sm" color="secondary">
        With selectableCountry the dial-code prefix becomes a dropdown. Changing the
        country remasks the digits already entered instead of clearing them, and the
        E.164 value is rebuilt against the new dial code.
      </Text>
      <PhoneInput
        label="Phone number"
        selectableCountry
        country={country}
        onCountryChange={setCountry}
        value={raw}
        onChange={(rawDigits, _formatted, meta) => {
          setRaw(rawDigits);
          setE164(meta.e164);
        }}
      />
      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Current values
          </Text>
          <Code size="sm">{JSON.stringify({ country, raw, e164 }, null, 2)}</Code>
        </Block>
      </Card>
    </Block>
  );
}
```

### Country Formats
ID: `PhoneInput.formats` • Tags: formatting, country, phone • Category: features • Status: experimental • Since: 1.0.0

Showcase of built-in country presets with their localized masks and raw digit output.

```tsx
const [us, setUs] = useState('');
  const [uk, setUk] = useState('');
  const [fr, setFr] = useState('');
  const [br, setBr] = useState('');
  return (
    <Block fullWidth>
      <Text weight="semibold">Country formatting</Text>
      <Text size="sm" color="secondary">
        Compare built-in masks for several countries. Each input stores digits only while rendering a localized format.
      </Text>
      <Block>
        <PhoneInput
          label="United States"
          country="US"
          value={us}
          onChange={(raw) => setUs(raw)}
          showCountryCode
        />
        <PhoneInput
          label="United Kingdom"
          country="GB"
          value={uk}
          onChange={(raw) => setUk(raw)}
          showCountryCode
        />
        <PhoneInput
          label="France"
          country="FR"
          value={fr}
          onChange={(raw) => setFr(raw)}
          showCountryCode
        />
        <PhoneInput
          label="Brazil"
          country="BR"
          value={br}
          onChange={(raw) => setBr(raw)}
          showCountryCode
        />
      </Block>
      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Raw digit values
          </Text>
          <Code size="sm">{JSON.stringify({ us, uk, fr, br }, null, 2)}</Code>
        </Block>
      </Card>
    </Block>
  );
}
```

### Mask Visibility
ID: `PhoneInput.mask-visibility` • Tags: country-code, placeholder • Category: features • Status: experimental • Since: 1.0.0

Demonstrates showing or hiding the country code prefix while preserving raw digits.

```tsx
const [withCountryCode, setWithCountryCode] = useState('');
  const [withoutCountryCode, setWithoutCountryCode] = useState('');
  return (
    <Block fullWidth>
      <Text weight="semibold">Country code visibility</Text>
      <Text size="sm" color="secondary">
        Toggle the country prefix while keeping the same underlying digits.
      </Text>
      <Block>
        <Block>
          <PhoneInput
            label="With country code"
            value={withCountryCode}
            onChange={(raw) => setWithCountryCode(raw)}
            country="US"
            showCountryCode
          />
          <Text size="xs" color="secondary">
            Raw digits: {withCountryCode || '—'}
          </Text>
        </Block>
        <Block>
          <PhoneInput
            label="Without country code"
            value={withoutCountryCode}
            onChange={(raw) => setWithoutCountryCode(raw)}
            country="US"
            showCountryCode={false}
          />
          <Text size="xs" color="secondary">
            Raw digits: {withoutCountryCode || '—'}
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
```

### Validation
ID: `PhoneInput.validation` • Tags: validation, feedback, phone • Category: features • Status: experimental • Since: 1.0.0

Length-based validation for US and international formats with inline messaging.

```tsx
const [usRaw, setUsRaw] = useState('');
  const [usFormatted, setUsFormatted] = useState('');
  const [internationalRaw, setInternationalRaw] = useState('');
  const [internationalFormatted, setInternationalFormatted] = useState('');
  const isValidUs = useMemo(() => usRaw.length === 10, [usRaw]);
  const isValidInternational = useMemo(
    () => internationalRaw.length >= 7 && internationalRaw.length <= 15,
    [internationalRaw]
  );
  return (
    <Block fullWidth>
      <Text weight="semibold">Validation states</Text>
      <Text size="sm" color="secondary">
        Surface validation messages based on raw digit counts for domestic and international numbers.
      </Text>
      <Block>
        <Block>
          <PhoneInput
            label="US phone (10 digits required)"
            value={usRaw}
            onChange={(raw, formatted) => {
              setUsRaw(raw);
              setUsFormatted(formatted);
            }}
            country="US"
            showCountryCode
            error={usRaw.length > 0 && !isValidUs ? 'Enter a 10-digit US phone number' : undefined}
          />
          <Text size="xs" color={isValidUs || usRaw.length === 0 ? 'success' : 'error'}>
            {usRaw.length === 0
              ? 'Enter a phone number'
              : isValidUs
                ? `✓ ${usFormatted}`
                : `${usRaw.length}/10 digits entered`}
          </Text>
        </Block>
        <Block>
          <PhoneInput
            label="International phone (7-15 digits)"
            value={internationalRaw}
            onChange={(raw, formatted) => {
              setInternationalRaw(raw);
              setInternationalFormatted(formatted);
            }}
            defaultCountry="INTL"
            autoDetect
            showCountryCode
            error={
              internationalRaw.length > 0 && !isValidInternational
                ? 'International numbers should be 7-15 digits'
                : undefined
            }
          />
          <Text
            size="xs"
            color={isValidInternational || internationalRaw.length === 0 ? 'success' : 'error'}
          >
            {internationalRaw.length === 0
              ? 'Enter an international phone number'
              : isValidInternational
                ? `✓ ${internationalFormatted}`
                : 'Adjust to 7-15 digits'}
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
```

### Advanced Masking
ID: `PhoneInput.advanced-masking` • Tags: mask, formatting, advanced • Category: features • Status: experimental • Since: 1.0.0

Custom mask patterns for international formats and extension fields.

```tsx
const [intlRaw, setIntlRaw] = useState('');
  const [intlFormatted, setIntlFormatted] = useState('');
  const [extensionRaw, setExtensionRaw] = useState('');
  const [extensionFormatted, setExtensionFormatted] = useState('');
  return (
    <Block fullWidth>
      <Text weight="semibold">Advanced masking</Text>
      <Text size="sm" color="secondary">
        Apply custom mask patterns to control formatting for international numbers and extension fields.
      </Text>
      <Block>
        <PhoneInput
          label="International format"
          value={intlRaw}
          onChange={(raw, formatted) => {
            setIntlRaw(raw);
            setIntlFormatted(formatted);
          }}
          autoDetect={false}
          showCountryCode={false}
          mask="+00 (000) 000-0000"
          placeholder="+44 (7911) 123-456"
        />
        <Text size="xs" color="secondary">
          Raw digits: {intlRaw || '—'}
        </Text>
        <Text size="xs" color="secondary">
          Formatted: {intlFormatted || '—'}
        </Text>
      </Block>
      <Block>
        <PhoneInput
          label="North America with extension"
          value={extensionRaw}
          onChange={(raw, formatted) => {
            setExtensionRaw(raw);
            setExtensionFormatted(formatted);
          }}
          autoDetect={false}
          showCountryCode={false}
          mask="000-000-0000 x0000"
          placeholder="555-123-4567 x1234"
        />
        <Text size="xs" color="secondary">
          Raw digits: {extensionRaw || '—'}
        </Text>
        <Text size="xs" color="secondary">
          Formatted: {extensionFormatted || '—'}
        </Text>
      </Block>
    </Block>
  );
}
```
