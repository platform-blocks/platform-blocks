# Skeleton

Skeleton components provide visual placeholders for text, avatars, and blocks to reduce perceived loading time.

## Metadata

- Import: `import { Skeleton } from '@plocks/ui';`
- Tags: loading, placeholder, skeleton
- Docs: https://plocks.dev/components/Skeleton
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Skeleton

## Props

- `shape`: 'text' | 'chip' | 'avatar' | 'button' | 'card' | 'circle' | 'rectangle' | 'rounded' = 'rectangle' — Shape of the skeleton placeholder
- `size`: SizeValue = 'md' — Size of the skeleton component (a control-size token or px; `w`/`h` win)
- `radius`: RadiusValue — Corner radius: theme radius token, px, `'none'` or `'full'`. Defaults per shape.
- `animate`: boolean = true — Whether to show the loading (pulse) animation. Never runs while reduced motion is on.
- `animationDuration`: number = 1500 — Duration of the loading animation in milliseconds
- `colors`: [string, string] — Base and highlight colors of the pulse. Defaults to `backgrounds.border` / `backgrounds.borderStrong`.
- `accessibilityLabel`: string — Announce the placeholder as a loading status with this name (`role="status"`, `aria-busy`). Without it the skeleton is decorative and hidden from assistive technology — label the region that is loading instead.
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

Stack text, avatar, and block placeholders to preview the structure of incoming content while data loads.

```tsx
import { Block, Row, Skeleton } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Skeleton shape="text" w="60%" />
      <Skeleton shape="text" w="80%" />
      <Skeleton shape="text" w="40%" />
      <Row gap="md" align="center">
        <Skeleton shape="avatar" size="lg" />
        <Block grow={1}>
          <Skeleton shape="text" w="40%" />
          <Skeleton shape="text" w="60%" />
        </Block>
      </Row>
      <Skeleton shape="rectangle" h={120} />
      <Skeleton shape="button" w={120} />
    </Block>
  );
}
```

### Shapes

Preview the available skeleton shapes for avatars, typography lines, actions, and media blocks.

```tsx
import { Block, Row, Skeleton } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Row gap="lg" align="center" wrap="wrap">
        <Skeleton shape="avatar" size="sm" />
        <Skeleton shape="avatar" size="md" />
        <Skeleton shape="avatar" size="lg" />
        <Skeleton shape="avatar" size="xl" />
      </Row>
      <Block>
        <Skeleton shape="text" w="100%" />
        <Skeleton shape="text" w="90%" />
        <Skeleton shape="text" w="70%" />
      </Block>
      <Row gap="md" wrap="wrap">
        <Skeleton shape="button" w={80} />
        <Skeleton shape="button" w={100} />
        <Skeleton shape="button" w={120} />
      </Row>
      <Row gap="sm" wrap="wrap">
        <Skeleton shape="chip" />
        <Skeleton shape="chip" />
        <Skeleton shape="chip" />
      </Row>
      <Skeleton shape="rectangle" h={60} />
      <Skeleton shape="card" h={200} />
    </Block>
  );
}
```

### Card Layout

Combine avatar, text, and action placeholders to preview a rich card layout ahead of remote content.

```tsx
import { Block, Row, Skeleton, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();

  return (
    <Block
      p="lg"
      radius="lg"
      borderWidth={1}
      borderColor={theme.backgrounds.border}
      bg={theme.backgrounds.surface}
    >
      <Block>
        <Row gap="md" align="center">
          <Skeleton shape="avatar" size="lg" />
          <Block grow={1}>
            <Skeleton shape="text" w="32%" />
            <Skeleton shape="text" w="48%" />
          </Block>
        </Row>
        <Skeleton shape="rectangle" h={120} />
        <Block>
          <Skeleton shape="text" w="100%" />
          <Skeleton shape="text" w="78%" />
        </Block>
        <Row gap="sm" wrap="wrap">
          <Skeleton shape="chip" />
          <Skeleton shape="chip" />
          <Skeleton shape="chip" />
        </Row>
      </Block>
    </Block>
  );
}
```
