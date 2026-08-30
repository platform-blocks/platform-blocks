# Select

Select provides a dropdown interface for choosing from predefined options. It supports single and multi-selection modes, disabled states, validation, and customizable styling.

## Metadata

- Canonical name: `Select`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Select } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: input
- Docs: https://react-ui-library.com/components/Select
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Select

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | T \| null | No |  | Current value when the component is controlled. |
| `defaultValue` | T \| null | No |  | Initial value when the component manages its own state. |
| `onChange` | (value: T \| null, option?: SelectOption<T> \| null) => void | No |  | Callback fired whenever the selection changes. |
| `options` | SelectOption<T>[] | Yes |  | Collection of options available to choose from. |
| `placeholder` | string | No |  | Placeholder text shown when no value is selected. |
| `size` | SizeValue | No |  | Size token controlling trigger height and typography. |
| `radius` | any | No |  | Corner radius token applied to the trigger and dropdown. |
| `disabled` | boolean | No |  | Disables the control when set to true. |
| `label` | string | No |  | Optional label rendered above the trigger. |
| `description` | string | No |  | Optional short descriptive text shown directly under the label (above the field). |
| `helperText` | string | No |  | Helper copy displayed beneath the control. |
| `error` | string | No |  | Error message shown beneath the control in error state. |
| `searchable` | boolean | No |  | Enables client-side filtering of options. |
| `renderOption` | (opt: SelectOption<T>, active: boolean, selected: boolean) => React.ReactNode | No |  | Custom renderer for an individual option row. |
| `fullWidth` | boolean | No |  | Stretches the trigger to occupy the full width of its container. |
| `maxH` | number | No |  | Maximum height the dropdown may reach before it scrolls. |
| `closeOnSelect` | boolean | No |  | Whether the dropdown should close immediately after selection. |
| `clearable` | boolean | No |  | Allows the user to clear the current selection. |
| `clearButtonLabel` | string | No |  | Accessible label announced for the clear button when present. |
| `onClear` | () => void | No |  | Handler invoked after the selection is cleared. |
| `refocusAfterSelect` | boolean | No |  | Controls whether the trigger regains focus after selecting an option. |
| `keyboardAvoidance` | boolean | No |  | Whether dropdown positioning should avoid the on-screen keyboard. |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the description `<Text>` |
| `variant` | InputVariant | No |  | Visual variant of the trigger shell — `'default' \| 'filled' \| 'outline' \| 'unstyled'`. Mirrors `<Input variant>`. |
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
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `minH` | DimensionValue | No |  | Sets the minimum height |

## Examples

### Basic
ID: `Select.basic` • Tags: basic, label, placeholder, single • Category: usage • Status: stable • Since: 1.0.0

Simple single-value select with helper copy and live selection feedback.

```tsx
return (
    <Select
      label="Favorite sport"
      description="Choose your favorite sport"
      placeholder="Choose a sport"
      options={sports}
    />
  )
}
```

### Variants
ID: `Select.variants` • Tags: variants, filled, outline, unstyled • Category: general • Status: stable • Since: 1.0.0

`Select` accepts the same `variant` prop as `<Input>` — `default`, `filled`, `outline`, `unstyled` — and shares the underlying input styles, so the trigger reads consistently with text inputs in the same form.

```tsx
const variants = [
  { variant: 'default', label: 'Default' },
  { variant: 'filled', label: 'Filled' },
  { variant: 'outline', label: 'Outline' },
  { variant: 'unstyled', label: 'Unstyled' },
] as const
  const [value, setValue] = useState<string | null>(null)
  return (
    <Block flex>
      {variants.map(({ variant, label }) => (
        <Select
          key={variant}
          variant={variant}
          label={label}
          placeholder="Pick one…"
          options={sports}
          value={value}
          onChange={(v) => setValue(v as string | null)}
        />
      ))}
    </Block>
  )
}
```

### Custom rendering
ID: `Select.custom` • Tags: render, option, custom • Category: customization • Status: stable • Since: 1.0.0

Render each option with additional detail and selection styling using `renderOption`.

```tsx
const theme = useTheme()
  const [value, setValue] = useState<string | null>(detailedSports[0].value)
  const accent = theme.colorScheme === 'dark' ? theme.colors.primary[5] : theme.colors.primary[6]
  return (
    <Block w={400}>
      <Select
        label="Choose a sport"
        placeholder="Pick a sport"
        options={detailedSports}
        value={value}
        onChange={(selected) => setValue(selected as string)}
        renderOption={(option, active, selected) => {
          const { emoji, name, description } = option as DetailedSport
          return (
            <Block
              direction="row"
              align="center"
              gap={12}
              style={{
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: active || selected ? accent : 'transparent',
                backgroundColor: selected ? theme.colors.primary[0] : undefined,
              }}
            >
              <Text size="3xl">{emoji}</Text>
              <Block direction="column" style={{ flex: 1 }} gap={0}>
                <Text weight={selected ? '900' : '600'}>{name}</Text>
                <Text size="sm" color="secondary">
                  {description}
                </Text>
              </Block>
              {selected ? <Icon name="check" size={16} color={accent} /> : null}
            </Block>
          )
        }}
      />
    </Block>
  )
}
```

### Disabled states
ID: `Select.disabled` • Tags: disabled, options, state • Category: states • Status: stable • Since: 1.0.0

Disable individual options or the full control to reflect availability.

```tsx
// One option is taken out of play to show the per-option disabled state next to
// the whole-field one.
const options = sports.map((option) =>
  option.value === 'basketball' ? { ...option, label: 'Basketball (disabled)', disabled: true } : option,
)
  const [value, setValue] = useState<string | null>(sports[0].value)
  return (
    <Block flex direction="row">
      <Select
        label="Disabled option example"
        options={options}
        value={value}
        onChange={(val) => setValue(val as string)}
      />
      <Select label="Entire select disabled" options={options} value={value} disabled />
    </Block>
  )
}
```

### Persistent menu
ID: `Select.noCloseOnSelect` • Tags: persistent, close-on-select, comparison • Category: interaction • Status: stable • Since: 1.0.0

Keep the dropdown open after each choice for quick comparisons.

```tsx
const [value, setValue] = useState<string | null>(null)
  return (
    <Select
      label="Persistent menu"
      description="Menu doesn't close on option press"
      options={sports}
      value={value}
      onChange={(val) => setValue(val as string)}
      closeOnSelect={false}
    />
  )
}
```
