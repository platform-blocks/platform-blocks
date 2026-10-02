# Block

Block is a layout primitive for building styled views.

## Metadata

- Import: `import { Block } from '@plocks/ui';`
- Tags: layout, building-block, polymorphic, foundational
- Docs: https://plocks.dev/components/Block
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Block

## Props

- `children`: React.ReactNode — Child elements to render inside the block
- `component`: React.ElementType — A custom component to render instead of `View`. It receives the resolved `style` and every other forwarded prop. HTML tag names (`'div'`, `'button'`, …) render a `View` — use `role` for semantics.
- `className`: string — Custom className, forwarded to a custom `component` only (web).
- `onPress`: PressableProps['onPress'] — Render an interactive Pressable root when supplied.
- `onLongPress`: PressableProps['onLongPress']
- `onPressIn`: PressableProps['onPressIn']
- `onPressOut`: PressableProps['onPressOut']
- `onMouseEnter`: () => void — Web pointer entry on the rendered root.
- `onMouseLeave`: () => void — Web pointer exit on the rendered root.
- `disabled`: PressableProps['disabled']
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `radius`: RadiusValue — Border radius: a `theme.radii` token, px number, `'none'` or `'full'`.
- `borderWidth`: number — Border width
- `borderColor`: string — Border color
- `borderTopWidth`: number
- `borderRightWidth`: number
- `borderBottomWidth`: number
- `borderLeftWidth`: number
- `borderTopColor`: string
- `borderRightColor`: string
- `borderBottomColor`: string
- `borderLeftColor`: string
- `borderTopLeftRadius`: number
- `borderTopRightRadius`: number
- `borderStyle`: ViewStyle['borderStyle']
- `overflow`: ViewStyle['overflow']
- `aspectRatio`: number
- `touchAction`: 'auto' | 'none' | 'pan-x' | 'pan-y' | 'manipulation' — Web touch gesture handling; useful for drag surfaces.
- `translateY`: number — Small visual offset without affecting surrounding layout.
- `rotate`: string — Rotation around the block center, such as `"45deg"`.
- `shadow`: ShadowToken — Shadow: a `theme.shadows` token.
- `fullWidth`: boolean — Whether to take full width (100%) - shorthand for w="full"; an explicit `w` wins
- `fluid`: boolean — Makes block take full available height (flex: 1) - useful for scrollable containers
- `grow`: boolean | number — Flex grow
- `shrink`: boolean | number — Flex shrink
- `basis`: number | string — Flex basis
- `direction`: 'row' | 'column' | 'row-reverse' | 'column-reverse' — Flex direction
- `align`: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' — Align items
- `alignSelf`: ViewStyle['alignSelf'] — Alignment of this block within its parent.
- `justify`: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' — Justify content
- `wrap`: boolean | 'nowrap' | 'wrap' | 'wrap-reverse' — Flex wrap
- `gap`: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' — Gap between children (`theme.spacing` token or px). Defaults to `'sm'`; pass `0` to remove it.
- `position`: 'relative' | 'absolute' — Position type
- `top`: number | string — Top position
- `right`: number | string — Right position (physical; use `end` to mirror in right-to-left layouts)
- `bottom`: number | string — Bottom position
- `left`: number | string — Left position (physical; use `start` to mirror in right-to-left layouts)
- `inset`: number | string — Shorthand for all four physical insets.
- `start`: number | string — Start inset (logical: left in LTR, right in RTL)
- `end`: number | string — End inset (logical: right in LTR, left in RTL)
- `zIndex`: number — Z-index
- `flex`: boolean | number — Whether to render as a flex container

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Build a card with `bg`, `p` and `radius`, share a row with `grow` and a fixed `w`, and render button-style actions with `component`, all on `Block` without custom stylesheets.

```tsx
import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block w="100%" maw={420}>
      <Block bg="#111827" radius="lg" p="lg">
        <Text fw="semibold" c="white">
          Release summary
        </Text>
        <Text size="sm" c="rgba(255,255,255,0.75)">
          Version 2.4 is live in every region.
        </Text>
      </Block>

      <Block direction="row">
        <Block grow bg="#2563eb" radius="md" p="md">
          <Text fw="semibold" c="white">
            Velocity
          </Text>
          <Text size="sm" c="rgba(255,255,255,0.8)">
            42 points
          </Text>
        </Block>
        <Block w={140} bg="#f9fafb" radius="md" p="md">
          <Text fw="semibold">Backlog</Text>
          <Text size="sm" c="muted">
            18 items
          </Text>
        </Block>
      </Block>

      <Block direction="row">
        <Block component="button" bg="#2563eb" radius="md" px="lg" py="sm">
          <Text c="white" fw="semibold">
            Create project
          </Text>
        </Block>
        <Block
          component="button"
          radius="md"
          px="lg"
          py="sm"
          borderWidth={1}
          borderColor="#2563eb"
        >
          <Text c="#2563eb" fw="semibold">
            View roadmap
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
```

### bg shorthand

`bg` resolves through the theme. Pass a palette name (`'primary'`, `'success'`) for a subtle tint (shade-1), a `'palette.shade'` like `'primary.6'` for a specific shade, a theme-background key (`'surface'`, `'subtle'`, `'elevated'`), or any CSS color string. The same resolver powers `<Card bg=...>`.

```tsx
import { Block, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="sm" wrap="wrap">
      <Block bg="primary" p="sm" radius="md">
        <Text>primary</Text>
      </Block>
      <Block bg="success" p="sm" radius="md">
        <Text>success</Text>
      </Block>
      <Block bg="warning" p="sm" radius="md">
        <Text>warning</Text>
      </Block>
      <Block bg="error" p="sm" radius="md">
        <Text>error</Text>
      </Block>
      <Block bg="primary.6" p="sm" radius="md">
        <Text c="white">primary.6</Text>
      </Block>
      <Block bg="gray.2" p="sm" radius="md">
        <Text>gray.2</Text>
      </Block>
      <Block bg="surface" p="sm" radius="md" borderWidth={1} borderColor="#ddd">
        <Text>surface</Text>
      </Block>
      <Block bg="subtle" p="sm" radius="md">
        <Text>subtle</Text>
      </Block>
      <Block bg="#a855f7" p="sm" radius="md">
        <Text c="white">#a855f7</Text>
      </Block>
    </Row>
  );
}
```
