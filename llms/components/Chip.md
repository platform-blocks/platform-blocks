# Chip

The Chip component displays compact elements that represent an input, attribute, or action. Supports different colors, sizes, and interactive features like removal. Inner label accepts the full Text-prop API via `labelProps`.

## Metadata

- Canonical name: `Chip`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Chip } from '@platform-blocks/react-ui-library';`
- Category: data
- Tags: chip, tag, badge, label, removable
- Docs: https://react-ui-library.com/components/Chip
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Chip

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | Yes |  |  |
| `size` | SizeValue | No |  |  |
| `variant` | 'filled' \| 'outline' \| 'light' \| 'subtle' \| 'surface' \| 'gradient' | No |  | Visual style. `surface` is the neutral option — it fills from the theme's background tokens instead of the `color` palette, sitting one step darker than the surface behind it (input tokens, filter pills). Ignores `color`. |
| `color` | ThemeColor | No |  | Theme palette name or CSS color. Not used by the `surface` variant. |
| `onPress` | () => void | No |  |  |
| `dot` | boolean | No |  | Show a small leading status dot. Defaults to the chip's resolved text color. |
| `dotColor` | string | No |  | Override the dot color (any CSS/theme color string). Only used when `dot` is set. |
| `startIcon` | React.ReactNode | No |  |  |
| `endIcon` | React.ReactNode | No |  |  |
| `onRemove` | () => void | No |  |  |
| `removePosition` | 'left' \| 'right' | No |  |  |
| `disabled` | boolean | No |  |  |
| `style` | StyleProp<ViewStyle> | No |  |  |
| `textStyle` | StyleProp<TextStyle> | No |  |  |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the inner label `<Text>` (style, weight, ff, size, color). |
| `radius` | any | No |  |  |
| `shadow` | any | No |  |  |
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

## Examples

### Basics
ID: `Chip.basic` • Tags: chip, getting-started • Category: basics • Status: stable • Since: 1.0.0

Wrap any label in a Chip to render a compact tag — the default `filled` variant and `primary` color apply automatically.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Chip>Design</Chip>
      <Chip>Engineering</Chip>
      <Chip>Research</Chip>
    </Row>
  )
}
```

### Semantic colors
ID: `Chip.colors` • Tags: colors, theming • Category: theming • Status: stable • Since: 1.0.0

Map the `color` prop to semantic tokens like `primary`, `success`, `warning`, `error`, or `gray` so Chips inherit your design system palette without inline styles.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="error">Error</Chip>
      <Chip color="gray">Gray</Chip>
    </Row>
  )
}
```

### Size scale
ID: `Chip.sizes` • Tags: sizes, density • Category: layout • Status: stable • Since: 1.0.0

Select a `size` from `xs` through `3xl` to match the Chip density with the surrounding controls.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Chip size={size}>Chip</Chip>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Variant styles
ID: `Chip.variants` • Tags: variants, styling • Category: appearance • Status: stable • Since: 1.0.0

Choose a `variant` such as `filled`, `outline`, `light`, `subtle`, or `gradient` to adjust visual weight without changing the Chip label or color. `surface` is the neutral option: it fills from the theme's background tokens instead of the `color` palette, landing one step darker than whatever it sits on in both light and dark. That recessed read makes it the right pick for input tokens, filter pills, and other chrome that shouldn't look like a status color.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Chip variant="filled" color="primary">
        Filled
      </Chip>
      <Chip variant="outline" color="primary">
        Outline
      </Chip>
      <Chip variant="light" color="primary">
        Light
      </Chip>
      <Chip variant="subtle" color="primary">
        Subtle
      </Chip>
      <Chip variant="surface">
        Surface
      </Chip>
      <Chip variant="gradient" color="primary">
        Gradient
      </Chip>
    </Row>
  )
}
```

### Status dot
ID: `Chip.dot` • Tags: dot, status, indicator • Category: appearance • Status: stable • Since: 1.0.0

Add a leading status dot with the `dot` prop. It defaults to the chip's resolved text color; override it with `dotColor`.

```tsx
return (
    <Block fullWidth={false}>
      <Row gap="xs" wrap="wrap" align="center">
        <Chip variant="filled" color="success" dot>Active</Chip>
        <Chip variant="light" color="warning" dot>Pending</Chip>
        <Chip variant="outline" color="error" dot>Failed</Chip>
        <Chip variant="subtle" color="gray" dot>Draft</Chip>
      </Row>
      <Row gap="xs" wrap="wrap" align="center">
        <Chip variant="light" color="gray" dotColor="#22C55E" dot>Online</Chip>
        <Chip variant="light" color="gray" dotColor="#F59E0B" dot>Away</Chip>
        <Chip variant="light" color="gray" dotColor="#EF4444" dot>Busy</Chip>
      </Row>
      <Text size="xs" color="muted">
        Use <Text size="xs" weight="600">dot</Text> to toggle the indicator and{' '}
        <Text size="xs" weight="600">dotColor</Text> to set a custom color.
      </Text>
    </Block>
  )
}
```

### Shadow depth
ID: `Chip.shadow` • Tags: shadow, emphasis • Category: appearance • Status: stable • Since: 1.0.0

Use the `shadow` prop from `none` to `xl` when a Chip needs extra elevation to stand out from nearby content.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Chip shadow="none">No Shadow</Chip>
      <Chip shadow="xs">XS Shadow</Chip>
      <Chip shadow="sm">SM Shadow</Chip>
      <Chip shadow="md">MD Shadow</Chip>
      <Chip shadow="lg">LG Shadow</Chip>
      <Chip shadow="xl">XL Shadow</Chip>
    </Row>
  )
}
```

### Removable tags
ID: `Chip.interactive` • Tags: interactive, removable • Category: interactions • Status: stable • Since: 1.0.0

Provide an `onRemove` handler to turn Chips into editable tags; the component renders a dismiss icon and calls your callback with no extra wiring.

```tsx
const initialSports = [
  { label: 'Soccer', emoji: '⚽' },
  { label: 'Basketball', emoji: '🏀' },
  { label: 'Tennis', emoji: '🎾' },
]
  const [chips, setChips] = useState(initialSports)
  const handleRemove = (chipToRemove: string) => {
    setChips((current) => current.filter((chip) => chip.label !== chipToRemove))
  }
  return (
    <Block>
      {chips.map((chip) => (
        <Chip
          key={chip.label}
          onRemove={() => handleRemove(chip.label)}
        >
          {chip.label}
        </Chip>
      ))}
    </Block>
  )
}
```

### Theme Matrix
ID: `Chip.theme-matrix` • Category: general

```tsx
const VARIANTS: NonNullable<ChipProps['variant']>[] = [
  'filled',
  'outline',
  'light',
  'subtle',
  'gradient',
]
// Core palette colors plus one raw custom color, to prove the resolver works for both.
const ROWS: { color: string; label: string }[] = [
  { color: 'primary', label: 'Primary' },
  { color: 'secondary', label: 'Secondary' },
  { color: 'success', label: 'Success' },
  { color: 'warning', label: 'Warning' },
  { color: 'error', label: 'Error' },
  { color: 'gray', label: 'Gray' },
  { color: '#7C3AED', label: 'Custom' },
]
const LABEL_W = 78
const CELL_W = 104
// A single chip with a leading status dot. The dot defaults to the chip's own
// resolved text color, so the indicator stays legible across every variant +
// scheme without any per-cell color plumbing.
function ChipCell({ variant, color, label }: { variant: NonNullable<ChipProps['variant']>; color: string; label: string }) {
  return (
    <Row justify="center" style={{ width: CELL_W }}>
      <Chip variant={variant} color={color} size="sm" dot>
        {label}
      </Chip>
    </Row>
  )
}
function Matrix() {
  return (
    <Block fullWidth={false}>
      {/* Column headers */}
      <Row gap="xs" align="center">
        <Text style={{ width: LABEL_W }}> </Text>
        {VARIANTS.map((v) => (
          <Text
            key={v}
            size="xs"
            color="muted"
            align="center"
            style={{ width: CELL_W }}
          >
            {v}
          </Text>
        ))}
      </Row>
      {ROWS.map(({ color, label }) => (
        <Row key={color} gap="xs" align="center">
          <Text size="xs" color="muted" style={{ width: LABEL_W }}>
            {label}
          </Text>
          {VARIANTS.map((v) => (
            <ChipCell key={v} variant={v} color={color} label={label} />
          ))}
        </Row>
      ))}
    </Block>
  )
}
function Panel({
  theme,
  title,
  surface,
}: {
  theme: typeof DEFAULT_THEME
  title: string
  surface: string
}) {
  return (
    <PlatformBlocksThemeProvider theme={theme} inherit={false}>
      <Card
        withBorder
        padding="lg"
        radius="lg"
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: 380, minWidth: 300 }}
      >
        <Block fullWidth>
          <Row justify="space-between" align="baseline">
            <Text weight="600">{title}</Text>
            <Text size="xs" color="muted">
              {surface}
            </Text>
          </Row>
          <Matrix />
        </Block>
      </Card>
    </PlatformBlocksThemeProvider>
  )
}
  // Two panels, each locked to a scheme, so every variant can be read side by side
  // on the real light and dark surfaces. Text is resolved by measured contrast, so
  // every variant stays legible on both.
  return (
    <Row gap="md" wrap="wrap" align="stretch">
      <Panel theme={DEFAULT_THEME} title="Light surface" surface="#FFFFFF" />
      <Panel theme={DARK_THEME} title="Dark surface" surface="#1C1C1E" />
    </Row>
  )
}
```
