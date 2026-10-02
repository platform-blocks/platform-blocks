# Select

Select provides a dropdown interface for choosing from predefined options. It supports single and multi-selection modes, disabled states, validation, and customizable styling.

## Metadata

- Import: `import { Select } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Select
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Select

## Props

- `value`: T | null — Current value when the component is controlled. `null` = nothing selected.
- `defaultValue`: T | null — Initial value when the component manages its own state.
- `onChange`: (value: T | null, option: SelectOption<T> | null) => void — Called with the new value and its option (`null, null` when cleared).
- `options` (required): SelectOption<T>[] — Collection of options available to choose from.
- `placeholder`: string = 'Select…' — Placeholder text shown when no value is selected.
- `searchable`: boolean = false — Adds a filter input at the top of the dropdown.
- `searchPlaceholder`: string = 'Search…' — Placeholder of the filter input. @default 'Search…'
- `nothingFoundMessage`: string = 'Nothing found' — Shown when the filter matches nothing. @default 'Nothing found'
- `renderOption`: (opt: SelectOption<T>, active: boolean, selected: boolean) => React.ReactNode — Custom renderer for an individual option row (the row stays an accessible option).
- `maxDropdownHeight`: number = 260 — Maximum height the dropdown may reach before it scrolls. @default 260
- `closeOnSelect`: boolean = true — Whether the dropdown closes after a selection. @default true
- `clearable`: boolean = false — Allows the user to clear the current selection.
- `refocusAfterSelect`: boolean = true — Whether the trigger keeps focus after a selection (web). `false` blurs it.
- `keyboardAvoidance`: boolean = true — Whether dropdown positioning should avoid the on-screen keyboard. @default true
- `onDropdownOpen`: () => void — Called when the dropdown opens.
- `onDropdownClose`: () => void — Called when the dropdown closes.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`placeholderTextColor` `clearButtonLabel` `onClear` `startSection` `startSectionProps`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { PickerTrigger } from '@plocks/ui';`

### PickerTrigger

- `triggerRef`: React.Ref<View> — Ref of the pressable trigger — the focus target and the floating anchor.
- `triggerProps`: PickerTriggerElementProps — Spread on the trigger (role, aria-*, id, onKeyDown, …).
- `onPress` (required): (event: GestureResponderEvent) => void
- `displayValue`: string — Text shown in the box. Empty / undefined shows the placeholder.
- `placeholder`: string
- `placeholderTextColor`: string
- `size`: SizeValue
- `radius`: RadiusValue
- `variant`: 'default' | 'filled' | 'outline' | 'unstyled'
- `opened`: boolean — Dropdown open: the frame border takes the accent color.
- `invalid`: boolean
- `disabled`: boolean
- `readOnly`: boolean
- `startSection`: React.ReactNode
- `endSection`: React.ReactNode — Trailing affordance (chevron / calendar). Decorative: hidden from assistive technology.
- `startSectionProps`: Omit<ViewProps, 'children'>
- `endSectionProps`: Omit<ViewProps, 'children'>
- `showClear`: boolean — Show the clear button (a sibling of the trigger, never nested in it).
- `onClear`: () => void
- `clearButtonLabel`: string
- `testID`: string
- `frameStyle`: StyleProp<ViewStyle> — Extra styles for the frame (merged last).

## Types

```ts
export interface SelectOption<T = any> {
  /** Human-readable text displayed for the option. */
  label: string;
  /** Value returned when the option is chosen. */
  value: T;
  /**
   * Secondary line rendered under the label inside the dropdown. The trigger
   * still shows the label alone, so this is for disambiguating options, not for
   * copy the user needs after choosing.
   */
  description?: string;
  /** When true, the option renders but cannot be selected. */
  disabled?: boolean;
}

export type PickerTriggerElementProps = Omit<PressableProps, 'style' | 'children' | 'onPress' | 'disabled'>;
```

## Examples

### Basics

Simple single-value select with helper copy and live selection feedback.

```tsx
import { Select } from '@plocks/ui'
import { sports } from '../data'

export function Demo() {
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

`data.ts`

```ts
import type { SelectOption } from '@plocks/ui';

export const sports: SelectOption<string>[] = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Football', value: 'football' },
]

/** Emoji and blurb are only needed by the custom rendering demo. */
export const detailedSports = [
  { name: 'Soccer', emoji: '⚽', value: 'soccer', description: 'Continuous play across two 45-minute halves.' },
  { name: 'Basketball', emoji: '🏀', value: 'basketball', description: 'Fast breaks balanced with half-court sets.' },
  { name: 'Tennis', emoji: '🎾', value: 'tennis', description: 'Sets decided by holding and breaking serve.' },
  { name: 'Football', emoji: '🏈', value: 'football', description: 'Down-by-down strategy on a 100-yard field.' },
].map((sport) => ({ ...sport, label: `${sport.emoji} ${sport.name}` }))

export type DetailedSport = (typeof detailedSports)[number]
```

### Variants

`Select` accepts the same `variant` prop as `<Input>` — `default`, `filled`, `outline`, `unstyled` — and shares the underlying input styles, so the trigger reads consistently with text inputs in the same form.

```tsx
import { useState } from 'react'
import { Block, Select } from '@plocks/ui'
import { sports } from '../data'

const variants = [
  { variant: 'default', label: 'Default' },
  { variant: 'filled', label: 'Filled' },
  { variant: 'outline', label: 'Outline' },
  { variant: 'unstyled', label: 'Unstyled' },
] as const

export function Demo() {
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

`data.ts` is the same file shown under “Basics” above.

### Custom rendering

Render each option with additional detail and selection styling using `renderOption`.

```tsx
import { useState } from 'react'
import { Block, Icon, Select, Text, useTheme } from '@plocks/ui'
import { detailedSports, type DetailedSport } from '../data'

export function Demo() {
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
                <Text fw={selected ? '900' : '600'}>{name}</Text>
                <Text size="sm" c="secondary">
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

`data.ts` is the same file shown under “Basics” above.

### Disabled states

Disable individual options or the full control to reflect availability.

```tsx
import { useState } from 'react'
import { Block, Select } from '@plocks/ui'
import { sports } from '../data'

// One option is taken out of play to show the per-option disabled state next to
// the whole-field one.
const options = sports.map((option) =>
  option.value === 'basketball' ? { ...option, label: 'Basketball (disabled)', disabled: true } : option,
)

export function Demo() {
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

`data.ts` is the same file shown under “Basics” above.

### Persistent menu

Keep the dropdown open after each choice for quick comparisons.

```tsx
import { useState } from 'react'
import { Select } from '@plocks/ui'
import { sports } from '../data'

export function Demo() {
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

`data.ts` is the same file shown under “Basics” above.
