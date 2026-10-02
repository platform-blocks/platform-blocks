# ScrollArea

ScrollArea provides a scrollable container with named layout and spacing props.

## Metadata

- Import: `import { ScrollArea } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/ScrollArea
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ScrollArea

## Props

- `children`: React.ReactNode
- `contentProps`: ContentProps — Layout and spacing of the scrollable content.
- `contentContainerStyle`: ScrollViewProps['contentContainerStyle'] — Escape hatch for native ScrollView content behavior.
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

Plus the `Block` props (`className` `onPress` `onLongPress` `onPressIn` `onPressOut` `onMouseEnter` `onMouseLeave` `disabled`): https://plocks.dev/llms/components/Block.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
type ContentProps = BlockStyleProps & StyleProps;
```

## Examples

### Basics

ScrollArea provides a scrollable container with named layout and spacing props.

```tsx
import { Block, ScrollArea, Text } from '@plocks/ui';

export function Demo() {
  return (
    <ScrollArea fullWidth h={180} contentProps={{ p: 'md', gap: 'sm' }}>
      {Array.from({ length: 8 }, (_, index) => (
        <Block key={index} bg="subtle" p="sm">
          <Text>Item {index + 1}</Text>
        </Block>
      ))}
    </ScrollArea>
  );
}
```
