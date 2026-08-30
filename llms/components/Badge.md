# Badge

The Badge component displays compact elements that represent an input, attribute, or action. Supports different colors, sizes, and interactive features like removal. Inner label accepts the full Text-prop API via `labelProps`.

## Metadata

- Canonical name: `Badge`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Badge } from '@platform-blocks/react-ui-library';`
- Category: data
- Tags: chip, tag, badge, label, removable
- Docs: https://react-ui-library.com/components/Badge
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Badge

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | Yes |  |  |
| `size` | ComponentSizeValue | No |  |  |
| `variant` | 'filled' \| 'outline' \| 'light' \| 'subtle' \| 'gradient' | No |  |  |
| `v` | 'filled' \| 'outline' \| 'light' \| 'subtle' \| 'gradient' | No |  | Shorthand alias for `variant`. `variant` wins when both are set. |
| `color` | ThemeColor | No |  | Badge color. A palette token, `'primary.6'` shade syntax, or any CSS color. |
| `c` | ThemeColor | No |  | Shorthand alias for `color`, resolved identically. `color` wins when both are set. |
| `onPress` | () => void | No |  |  |
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
ID: `Badge.basic` • Tags: badge, getting-started • Category: basics • Status: stable • Since: 1.0.0

Wrap any label in a Badge to render a compact tag — the default `filled` variant and `primary` color apply automatically.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Badge>New</Badge>
      <Badge>Beta</Badge>
      <Badge>v1.0</Badge>
    </Row>
  )
}
```

### Semantic colors
ID: `Badge.colors` • Tags: colors, theming • Category: theming • Status: stable • Since: 1.0.0

Set the `color` prop to tokens such as `primary`, `success`, `warning`, `error`, or `gray` to align Badges with semantic meaning instead of hard-coded hex values.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Badge color="primary">Primary</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="warning">Warning</Badge>
      <Badge color="error">Error</Badge>
      <Badge color="gray">Gray</Badge>
    </Row>
  )
}
```

### Size scale
ID: `Badge.sizes` • Tags: sizes, density • Category: layout • Status: stable • Since: 1.0.0

Adjust the `size` prop (`xs` through `3xl`, or a number) to match the density of the surrounding UI.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Badge size={size}>Badge</Badge>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Variant styles
ID: `Badge.variants` • Tags: variants, styling • Category: appearance • Status: stable • Since: 1.0.0

Pick a `variant` like `filled`, `outline`, `light`, `subtle`, or `gradient` when you need to shift emphasis without changing the Badge content.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Badge variant="filled">Filled</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="light">Light</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="gradient">Gradient</Badge>
    </Row>
  )
}
```

### Shadow depth
ID: `Badge.shadow` • Tags: shadow, emphasis • Category: appearance • Status: stable • Since: 1.0.0

Use the `shadow` prop (`none` through `xl`) to raise a Badge when it needs extra emphasis over surrounding UI.

```tsx
return (
    <Row gap={8} wrap="wrap">
      <Badge shadow="none">No Shadow</Badge>
      <Badge shadow="xs">XS Shadow</Badge>
      <Badge shadow="sm">SM Shadow</Badge>
      <Badge shadow="md">MD Shadow</Badge>
      <Badge shadow="lg">LG Shadow</Badge>
      <Badge shadow="xl">XL Shadow</Badge>
    </Row>
  )
}
```

### Prop aliases
ID: `Badge.aliases` • Tags: aliases, shorthand • Category: props • Status: stable • Since: 1.0.0

Shorthand props `v` and `c` mirror `variant` and `color`, so you can write more compact JSX without losing any functionality.

```tsx
const badges = [
  { label: 'Primary Filled', variant: 'filled', color: 'primary' },
  { label: 'Secondary Outline', variant: 'outline', color: 'secondary' },
  { label: 'Success Light', variant: 'light', color: 'success' },
  { label: 'Warning Subtle', variant: 'subtle', color: 'warning' },
] as const
  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {badges.map((badge) => (
          <Badge
            key={`full-${badge.label}`}
            variant={badge.variant}
            color={badge.color}
          >
            {badge.label}
          </Badge>
        ))}
      </Row>
      <Row gap="sm" wrap="wrap">
        {badges.map((badge) => (
          <Badge key={`alias-${badge.label}`} v={badge.variant} c={badge.color}>
            {badge.label}
          </Badge>
        ))}
      </Row>
    </Block>
  )
}
```
