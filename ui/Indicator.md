# Indicator

Indicator places a status dot or count on a parent element.

## Metadata

- Import: `import { Indicator } from '@plocks/ui';`
- Tags: indicator, badge, status, count, dot
- Docs: https://plocks.dev/components/Indicator
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Indicator

## Props

- `size`: SizeValue | number = 'sm' — Dot diameter: a size token (the font size of that token) or px. @default 'sm'
- `color`: ColorProp = 'success' — Fill: palette token, `'primary.6'` shade syntax, or CSS color. @default 'success'
- `borderColor`: ColorProp = theme.backgrounds.surface — Ring color separating the dot from what it sits on. @default theme.backgrounds.surface
- `borderWidth`: number = 1
- `placement`: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right' — Corner of the parent. `left` / `right` follow the reading direction (they mirror under RTL).
- `offset`: number = 0
- `children`: React.ReactNode — Free-form content rendered inside the indicator dot. Useful when a custom icon is needed; for plain text counts prefer `label`, which auto-resizes the dot and applies a contrast-aware text color.
- `label`: React.ReactNode — Convenience text content (typically a count). When set, the dot expands to fit the label and the text uses a contrast-aware color.
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>` (style, fw, ff, size, c).
- `accessibilityLabel`: string — Accessible description of what the indicator means ("Online", "3 unread messages"). Without it a plain dot is decorative.
- `invisible`: boolean
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

Place `Indicator` inside a relatively positioned container to pin a status dot to its corner.

```tsx
import { Avatar, Block, Indicator } from '@plocks/ui';

export function Demo() {
  return (
    <Block position="relative">
      <Avatar size="lg" fallback="JS" />
      <Indicator size="md" accessibilityLabel="Online" />
    </Block>
  );
}
```

### Placements

Set `placement` to pin the indicator to any corner of its container.

```tsx
import { Block, Indicator, Row, Text } from '@plocks/ui';

const PLACEMENTS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      {PLACEMENTS.map((placement) => (
        <Block
          key={placement}
          w={88}
          h={88}
          radius="lg"
          bg="subtle"
          position="relative"
          align="center"
          justify="center"
        >
          <Text size="xs" c="secondary">
            {placement}
          </Text>
          <Indicator placement={placement} />
        </Block>
      ))}
    </Row>
  );
}
```

### Sizes

Set the `size` prop to any token (`xs`–`3xl`) for theme-aligned dots, or provide a raw number when you need a bespoke diameter for your badge.

```tsx
import { Block, Card, Indicator, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 24] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Card w={56} h={56} radius="lg">
            <Indicator placement="top-right" size={size} offset={4} />
          </Card>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Statuses

Map presence states (online, idle, busy, offline) to palette colors with `color`, and give each dot an `accessibilityLabel` so the status is announced, not just shown.

```tsx
import { Avatar, Block, Indicator, Row, Text } from '@plocks/ui';

const presenceStatuses = [
  { label: 'Online', palette: 'success', avatar: require('../../../../assets/avatars/avatar-1.png') },
  { label: 'Idle', palette: 'warning', avatar: require('../../../../assets/avatars/avatar-2.png') },
  { label: 'Busy', palette: 'error', avatar: require('../../../../assets/avatars/avatar-3.png') },
  { label: 'Offline', palette: 'gray', avatar: require('../../../../assets/avatars/avatar-4.png') },
] as const;

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap">
      {presenceStatuses.map((status) => (
        <Block key={status.label} align="center">
          <Block position="relative">
            <Avatar
              size={56}
              fallback={status.label.charAt(0)}
              src={status.avatar}
            />
            <Indicator size={14} color={status.palette} accessibilityLabel={status.label} />
          </Block>
          <Text size="xs" c="secondary">
            {status.label}
          </Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Labels & counts

Pass `label` to render a count or short text inside the indicator — the dot expands to a pill so multi-digit values fit. `labelProps` accepts any `<Text>` props for fonts, weights, etc. For arbitrary custom content (icons, status markers), use `children` instead.

```tsx
import { View } from 'react-native';
import { Block, Indicator, Row } from '@plocks/ui';

const Anchor = ({ children }: { children?: React.ReactNode }) => (
  <Block w={48} h={48} radius="full" bg="subtle" position="relative" align="center" justify="center">
    {children}
  </Block>
);

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap">
      <Anchor>
        <Indicator size={20} color="#ef4444" label={3} />
      </Anchor>
      <Anchor>
        <Indicator size={20} color="#ef4444" label={12} />
      </Anchor>
      <Anchor>
        <Indicator size={20} color="#ef4444" label="99+" />
      </Anchor>
      <Anchor>
        <Indicator size={22} color="#0ea5e9" label="42" labelProps={{ ff: 'monospace' }} />
      </Anchor>
      <Anchor>
        <Indicator
          size={22}
          color="#10b981"
          label="NEW"
          labelProps={{ tt: 'uppercase', lts: 1, size: 9 }}
        />
      </Anchor>
      <Anchor>
        <Indicator size={16} color="#10b981">
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
        </Indicator>
      </Anchor>
    </Row>
  );
}
```
