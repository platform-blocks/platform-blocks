# Divider

Divider separates content with a line or optional label.

## Metadata

- Import: `import { Divider } from '@plocks/ui';`
- Tags: divider, separator, line, section
- Docs: https://plocks.dev/components/Divider
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Divider

## Props

- `orientation`: 'horizontal' | 'vertical' — Layout direction of the line. `'horizontal'` spans width; `'vertical'` spans height. Defaults to `'horizontal'`.
- `variant`: 'solid' | 'dashed' | 'dotted' | 'gradient' — Visual style of the line. `'gradient'` fades transparent → color → transparent. Defaults to `'solid'`.
- `color`: ThemeColor — Line color. Accepts the named tokens `'border'` / `'subtle'` / `'muted'`, a palette name (`'success'` → a shade well below the accent, so a tinted rule still reads as chrome), `'primary.6'` shade syntax, or any CSS color. Defaults to `'border'`.
- `size`: SizeValue | number — Thickness of the divider (default 1). Accepts a size token or pixel value.
- `label`: React.ReactNode — Optional content rendered in the middle of the line. A string label is also the separator's accessible name.
- `labelPosition`: 'left' | 'center' | 'right' — Where the `label` sits along the line. `'left'` / `'right'` are the leading / trailing ends, so they mirror in right-to-left layouts. Defaults to `'center'`.
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>` (only when `label` is a string).
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

Insert horizontal dividers between sections to separate content; switch the `variant` prop to toggle between solid and dashed lines.

```tsx
import { Block, Divider, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Text variant="p" fw="medium">
        Q1 Highlights
      </Text>
      <Text variant="p">Revenue grew 12% year over year.</Text>
      <Divider />
      <Text variant="p">Customer retention improved across every region.</Text>
      <Divider variant="dashed" />
      <Text variant="p">Product roadmap updates will ship next quarter.</Text>
    </Block>
  );
}
```

### Color Variants

Set `color` to a line token (`border`, `subtle`, `muted`), a palette name like `primary` or `error`, or any CSS color. It defaults to `border`.

```tsx
import { Block, Divider, Text } from '@plocks/ui';

const COLORS = ['border', 'subtle', 'muted', 'gray', 'primary', 'secondary', 'success', 'warning', 'error'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {COLORS.map((color) => (
        <Block key={color} fullWidth>
          <Text variant="small" c="secondary">{color}</Text>
          <Divider color={color} />
        </Block>
      ))}
    </Block>
  );
}
```

### Gradient & opacity

The `gradient` variant fades transparent → color → transparent, perfect for breaking up sections without a hard edge. The `opacity` prop is a shorthand for `style={{ opacity }}` — combine it with `color` to dial in subtle separators.

```tsx
import { Block, Divider, Text } from '@plocks/ui';

const OPACITIES = [1, 0.5, 0.25];

export function Demo() {
  return (
    <Block fullWidth>
      <Block fullWidth>
        <Text variant="small" c="secondary">gradient</Text>
        <Divider variant="gradient" color="primary" />
      </Block>
      {OPACITIES.map((opacity) => (
        <Block key={opacity} fullWidth>
          <Text variant="small" c="secondary">opacity {opacity}</Text>
          <Divider color="primary" opacity={opacity} />
        </Block>
      ))}
    </Block>
  );
}
```

### Labeled Dividers

Provide a `label` node and adjust `labelPosition` plus `color` to separate form sections with contextual dividers.

```tsx
import { Block, Chip, Divider, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Text variant="p">Sign in with email</Text>
      <Divider label="or" />
      <Text variant="p">Continue with social accounts</Text>

      <Divider
        label={<Chip size="sm" variant="outline">Settings</Chip>}
        labelPosition="left"
        color="secondary"
      />
      <Text variant="p">Manage notification preferences</Text>

      <Divider label="Advanced options" labelPosition="right" color="primary" />
      <Text variant="p">Invite admins or export account data</Text>
    </Block>
  );
}
```

### Vertical Dividers

Switch `orientation="vertical"` to separate horizontal layouts like navigation and add `label` or `color` when you need emphasis.

```tsx
import { Block, Divider, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="center" wrap="wrap" direction="row" h={100}>
      <Text variant="p">Home</Text>
      <Divider orientation="vertical" />
      <Text variant="p">Fixtures</Text>
      <Divider orientation="vertical" color="primary" />
      <Text variant="p">Standings</Text>
      <Divider orientation="vertical" label="Live" color="warning" />
      <Text variant="p">Highlights</Text>
    </Block>
  );
}
```

### Sizes

Demonstrates how the `size` prop accepts both numeric values and spacing tokens so you can dial in subtle, comfortable, or bold divider weights.

```tsx
import { Block, Divider, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {SIZES.map((size) => (
        <Block key={size} fullWidth>
          <Text variant="small" c="secondary">{size}</Text>
          <Divider size={size} />
        </Block>
      ))}

      <Block fullWidth>
        <Text variant="small" c="secondary">1 (numeric)</Text>
        <Divider size={1} />
      </Block>
    </Block>
  );
}
```

### Variants

Showcase solid, dashed, and dotted dividers in both horizontal and vertical layouts to highlight how each variant can communicate different section breaks.

```tsx
import { Block, Divider, Text } from '@plocks/ui';

const VARIANTS = ['solid', 'dashed', 'dotted', 'gradient'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Block key={variant} fullWidth>
          <Text variant="small" c="secondary">{variant}</Text>
          <Divider variant={variant} />
        </Block>
      ))}

      <Block direction="row" align="center" wrap="wrap">
        <Text variant="small" fw="medium">
          Published
        </Text>
        <Divider orientation="vertical" variant="solid" style={{ height: 48 }} />
        <Text variant="small" fw="medium">
          Drafts
        </Text>
        <Divider orientation="vertical" variant="dashed" style={{ height: 48 }} />
        <Text variant="small" fw="medium">
          Scheduled
        </Text>
        <Divider orientation="vertical" variant="dotted" style={{ height: 48 }} />
        <Text variant="small" fw="medium">
          Archived
        </Text>
      </Block>
    </Block>
  );
}
```
