# Badge

Badge displays a compact status or count on a parent element.

## Metadata

- Import: `import { Badge } from '@plocks/ui';`
- Tags: chip, tag, badge, label, removable
- Docs: https://plocks.dev/components/Badge
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Badge

## Props

- `children` (required): React.ReactNode
- `size`: ComponentSizeValue — Size token (the badge renders well below a control of the same size), or height in px.
- `variant`: 'filled' | 'outline' | 'light' | 'subtle' | 'gradient' = 'subtle'
- `v`: 'filled' | 'outline' | 'light' | 'subtle' | 'gradient' — Shorthand alias for `variant`. `variant` wins when both are set.
- `color`: ColorProp — Badge color. A palette token, `'primary.6'` shade syntax, or any CSS color.
- `c`: ColorProp — Shorthand alias for `color`, resolved identically. `color` wins when both are set.
- `onPress`: () => void — Makes the badge a button.
- `startSection`: React.ReactNode — Content (usually an icon) before the label.
- `endSection`: React.ReactNode — Content (usually an icon) after the label.
- `onRemove`: () => void — Show a remove (×) button that calls this.
- `removePosition`: 'left' | 'right' — Which side the remove button sits on (`left`/`right` follow the reading direction).
- `removeButtonLabel`: string = `Remove <label>` — Accessible name of the remove button. @default `Remove <label>`
- `disabled`: boolean
- `textStyle`: StyleProp<TextStyle>
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the inner label `<Text>` (style, fw, ff, size, c).
- `radius`: RadiusValue = 'full' — Corner radius. @default 'full'
- `shadow`: ShadowToken — Drop shadow token. Badges are flat by default.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Wrap any label in a Badge to render a compact tag — the default `filled` variant and `primary` color apply automatically.

```tsx
import { Badge, Row } from '@plocks/ui'

export function Demo() {
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

Set `c` to tokens such as `primary`, `success`, `warning`, `error`, or `gray` to align Badges with semantic meaning instead of hard-coded hex values.

```tsx
import { Badge, Row } from '@plocks/ui'

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Badge c="primary">Primary</Badge>
      <Badge c="success">Success</Badge>
      <Badge c="warning">Warning</Badge>
      <Badge c="error">Error</Badge>
      <Badge c="gray">Gray</Badge>
    </Row>
  )
}
```

### Size scale

Adjust the `size` prop (`xs` through `3xl`, or a number) to match the density of the surrounding UI.

```tsx
import { Badge, Block, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
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

Pick a `variant` like `filled`, `outline`, `light`, `subtle`, or `gradient` when you need to shift emphasis without changing the Badge content.

```tsx
import { Badge, Row } from '@plocks/ui'

export function Demo() {
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

Use the `shadow` prop (`none` through `xl`) to raise a Badge when it needs extra emphasis over surrounding UI.

```tsx
import { Badge, Row } from '@plocks/ui'

export function Demo() {
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

`v` is shorthand for `variant`, so you can write more compact JSX without losing any functionality.

```tsx
import { Badge, Block, Row } from '@plocks/ui'

const badges = [
  { label: 'Primary Filled', variant: 'filled', color: 'primary' },
  { label: 'Secondary Outline', variant: 'outline', color: 'secondary' },
  { label: 'Success Light', variant: 'light', color: 'success' },
  { label: 'Warning Subtle', variant: 'subtle', color: 'warning' },
] as const

export function Demo() {
  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {badges.map((badge) => (
          <Badge key={`full-${badge.label}`} variant={badge.variant} c={badge.color}>
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
