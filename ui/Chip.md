# Chip

Chip displays a compact item that can represent a value, choice, or action.

## Metadata

- Import: `import { Chip } from '@plocks/ui';`
- Tags: chip, tag, badge, label, removable
- Docs: https://plocks.dev/components/Chip
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Chip

## Props

- `children` (required): React.ReactNode
- `size`: SizeValue — Size token; the chip renders one step smaller than a control of the same size.
- `variant`: 'filled' | 'outline' | 'light' | 'subtle' | 'surface' | 'gradient' — Visual style (of the checked state, for a selectable chip). `surface` is the neutral option — it fills from the theme's background tokens instead of the `color` palette, sitting one step darker than the surface behind it (input tokens, filter pills). Ignores `color`.
- `color`: ColorProp — Theme palette name, `'primary.6'` shade syntax, or CSS color. Not used by the `surface` variant.
- `onPress`: () => void — Makes the chip a button.
- `pressed`: boolean — Pressed state for a button chip, exposed as `aria-pressed` on web.
- `checked`: boolean — Checked state. Setting `checked`, `defaultChecked` or `onChange` makes the chip selectable: a checkbox (`aria-checked`) that toggles on press.
- `defaultChecked`: boolean — Initial checked state (uncontrolled selectable chip).
- `onChange`: (checked: boolean) => void — Called with the next checked state when a selectable chip is pressed.
- `uncheckedVariant`: 'filled' | 'outline' | 'light' | 'subtle' | 'surface' | 'gradient' = 'outline' — Variant of an unchecked selectable chip. @default 'outline'
- `dot`: boolean — Show a small leading status dot. Defaults to the chip's resolved text color.
- `dotColor`: ColorProp — Override the dot color (any CSS/theme color string). Only used when `dot` is set.
- `startSection`: React.ReactNode — Content (usually an icon) before the label.
- `endSection`: React.ReactNode — Content (usually an icon) after the label.
- `onRemove`: () => void — Show a remove (×) button that calls this.
- `removePosition`: 'left' | 'right' — Which side the remove button sits on (`left`/`right` follow the reading direction).
- `removeButtonLabel`: string = `Remove <label>` — Accessible name of the remove button. @default `Remove <label>`
- `disabled`: boolean
- `textStyle`: StyleProp<TextStyle>
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the inner label `<Text>` (style, fw, ff, size, c).
- `radius`: RadiusValue = 'full' — Corner radius. @default 'full'
- `shadow`: ShadowToken — Drop shadow token. Chips are flat by default.
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

Wrap any label in a Chip to render a compact tag — the default `filled` variant and `primary` color apply automatically.

```tsx
import { Chip, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip>Design</Chip>
      <Chip>Engineering</Chip>
      <Chip>Research</Chip>
    </Row>
  );
}
```

### Semantic colors

Map the `color` prop to semantic tokens like `primary`, `success`, `warning`, `error`, or `gray` so Chips inherit your design system palette without inline styles.

```tsx
import { Chip, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="error">Error</Chip>
      <Chip color="gray">Gray</Chip>
    </Row>
  );
}
```

### Size scale

Select a `size` from `xs` through `3xl` to match the Chip density with the surrounding controls.

```tsx
import { Block, Chip, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
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

Choose a `variant` such as `filled`, `outline`, `light`, `subtle`, or `gradient` to adjust visual weight without changing the Chip label or color. `surface` is the neutral option: it fills from the theme's background tokens instead of the `color` palette, landing one step darker than whatever it sits on in both light and dark. That recessed read makes it the right pick for input tokens, filter pills, and other chrome that shouldn't look like a status color.

```tsx
import { Chip, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip variant="filled">Filled</Chip>
      <Chip variant="outline">Outline</Chip>
      <Chip variant="light">Light</Chip>
      <Chip variant="subtle">Subtle</Chip>
      <Chip variant="surface">Surface</Chip>
      <Chip variant="gradient">Gradient</Chip>
    </Row>
  );
}
```

### Status dot

Add a leading status dot with the `dot` prop. It defaults to the chip's resolved text color; override it with `dotColor`.

```tsx
import { Block, Chip, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
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
    </Block>
  );
}
```

### Shadow depth

Use the `shadow` prop from `none` to `xl` when a Chip needs extra elevation to stand out from nearby content.

```tsx
import { Chip, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip shadow="none">No Shadow</Chip>
      <Chip shadow="xs">XS Shadow</Chip>
      <Chip shadow="sm">SM Shadow</Chip>
      <Chip shadow="md">MD Shadow</Chip>
      <Chip shadow="lg">LG Shadow</Chip>
      <Chip shadow="xl">XL Shadow</Chip>
    </Row>
  );
}
```

### Removable tags

Provide an `onRemove` handler to turn Chips into editable tags; the component renders a dismiss icon and calls your callback with no extra wiring.

```tsx
import { useState } from 'react';
import { Chip, Row } from '@plocks/ui';

export function Demo() {
  const [tags, setTags] = useState(['Soccer', 'Basketball', 'Tennis']);

  return (
    <Row gap={8} wrap="wrap">
      {tags.map((tag) => (
        <Chip key={tag} onRemove={() => setTags((current) => current.filter((t) => t !== tag))}>
          {tag}
        </Chip>
      ))}
    </Row>
  );
}
```

### Selectable

Pass `checked` + `onChange` (or `defaultChecked`) to make chips selectable. Each chip is a checkbox for assistive technology (`aria-checked`, Space toggles); unchecked chips render in `uncheckedVariant` (`outline` by default).

```tsx
import { useState } from 'react';
import { Chip, Row, Text, Block } from '@plocks/ui';

const TOPICS = ['React', 'React Native', 'Expo', 'TypeScript'];

export function Demo() {
  const [selected, setSelected] = useState<string[]>(['Expo']);

  const toggle = (topic: string) =>
    setSelected((current) => (current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic]));

  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {TOPICS.map((topic) => (
          <Chip key={topic} checked={selected.includes(topic)} onChange={() => toggle(topic)}>
            {topic}
          </Chip>
        ))}
      </Row>
      <Text size="xs" c="secondary">
        Selected: {selected.join(', ') || 'none'}
      </Text>
    </Block>
  );
}
```

### Theme Matrix

```tsx
import { Block, Card, Chip, DARK_THEME, DEFAULT_THEME, PlocksProvider, Row, Text } from '@plocks/ui';
import type { ChipProps } from '@plocks/ui';

const VARIANTS: NonNullable<ChipProps['variant']>[] = ['filled', 'outline', 'light', 'subtle', 'gradient'];

const ROWS = [
  { color: 'primary', label: 'Primary' },
  { color: 'secondary', label: 'Secondary' },
  { color: 'success', label: 'Success' },
  { color: 'warning', label: 'Warning' },
  { color: 'error', label: 'Error' },
  { color: 'gray', label: 'Gray' },
  { color: '#7C3AED', label: 'Custom' },
];

const LABEL_W = 78;
const CELL_W = 104;

function Matrix() {
  return (
    <Block>
      <Row gap="xs" align="center">
        <Text style={{ width: LABEL_W }}> </Text>
        {VARIANTS.map((variant) => (
          <Text key={variant} size="xs" c="muted" ta="center" style={{ width: CELL_W }}>
            {variant}
          </Text>
        ))}
      </Row>

      {ROWS.map(({ color, label }) => (
        <Row key={color} gap="xs" align="center">
          <Text size="xs" c="muted" style={{ width: LABEL_W }}>
            {label}
          </Text>
          {VARIANTS.map((variant) => (
            <Row key={variant} justify="center" style={{ width: CELL_W }}>
              <Chip variant={variant} color={color} size="sm">
                {label}
              </Chip>
            </Row>
          ))}
        </Row>
      ))}
    </Block>
  );
}

function Panel({ theme, title }: { theme: typeof DEFAULT_THEME; title: string }) {
  return (
    <PlocksProvider theme={theme} inherit={false}>
      <Card
        withBorder
        padding="lg"
        radius="lg"
        style={{ flexGrow: 1, flexShrink: 1, flexBasis: 380, minWidth: 300 }}
      >
        <Block fullWidth>
          <Text fw="600">{title}</Text>
          <Matrix />
        </Block>
      </Card>
    </PlocksProvider>
  );
}

export function Demo() {
  return (
    <Row gap="md" wrap="wrap" align="stretch">
      <Panel theme={DEFAULT_THEME} title="Light surface" />
      <Panel theme={DARK_THEME} title="Dark surface" />
    </Row>
  );
}
```
