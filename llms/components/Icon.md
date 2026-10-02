# Icon

The `Icon` component displays icons with optional captions and overlays, providing a flexible way to present visual content in your application.

## Metadata

- Import: `import { Icon } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Icon
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Icon

## Props

- `name`: string — Icon name from the registry
- `icon`: ExternalIconComponent | React.ReactElement — An external icon library component or element, rendered instead of `name`. Enables using any icon library (e.g. Tabler) without registry registration.
- `size`: IconSize = 'md' — Size token or px.
- `color`: ColorProp — Icon color: palette token (`'primary'`, `'error.6'`) or any CSS color. Defaults to `theme.text.primary`.
- `stroke`: number = 1.5 — Stroke thickness for outlined icons. Defaults to 1.5.
- `variant`: 'filled' | 'outlined' — Icon variant - overrides the default variant from icon definition
- `label`: string — Accessible name. An icon with a name is announced as an image; without one it is decorative (hidden from assistive technology).
- `accessibilityLabel`: string — Alias of `label`.
- `title`: string — Alias of `label` (the icon's title).
- `decorative`: boolean — Hide the icon from assistive technology. Defaults to `true` unless the icon has an accessible name (`label` / `accessibilityLabel` / `title`), so icons inside labelled controls never add noise to what a screen reader announces.
- `mirrorInRTL`: boolean — Whether to mirror this icon in RTL mode. If not specified, uses auto-detection based on icon name
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type ExternalIconComponent = React.ComponentType<ExternalIconProps>;

export type IconSize = SizeValue;

export interface ExternalIconProps {
  size?: number | string;
  color?: ColorValue;
  strokeWidth?: number | string;
  style?: StyleProp<ViewStyle>;
  /** Icon libraries take extra SVG props; they are passed through untouched. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- must accept any icon library's props (Tabler, lucide, vector-icons…).
  [key: string]: any;
}
```

## Examples

### Basics

Render any icon from the built-in Tabler set by its registry `name`.

```tsx
import { Icon, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="lg" align="center" wrap="wrap">
      <Icon name="home" />
      <Icon name="search" />
      <Icon name="bell" />
      <Icon name="calendar" />
      <Icon name="heart" />
      <Icon name="star" />
      <Icon name="user" />
      <Icon name="settings" />
    </Row>
  );
}
```

### Stroke

Set `stroke` to change the line thickness of outlined icons. It defaults to `1.5`.

```tsx
import { Flex, Icon, Text } from '@plocks/ui';

const strokeVariants = [
  { label: 'Thin (0.75)', value: 0.75 },
  { label: 'Default (1.5)', value: 1.5 },
  { label: 'Bold (3)', value: 3 },
];

export function Demo() {
  return (
    <Flex direction="row" align="center" gap="lg" wrap="wrap">
      {strokeVariants.map(({ label, value }) => (
        <Flex key={label} direction="column" align="center" gap="sm">
          <Icon name="contrast" size="xl" stroke={value} />
          <Text variant="small" style={{ textAlign: 'center' }}>{label}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
```

### Variants

Compare filled and outlined versions of the same icons.

```tsx
import { Column, Icon, Row, Text } from '@plocks/ui';

const variants = ['outlined', 'filled'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Row key={variant} gap="md" align="center">
          <Text>{variant}</Text>
          <Icon name="heart" variant={variant} size="xl" />
          <Icon name="star" variant={variant} size="xl" />
          <Icon name="bell" variant={variant} size="xl" />
        </Row>
      ))}
    </Column>
  );
}
```
