# HoverCard

HoverCard shows supplementary content beside a target on hover or focus.

## Metadata

- Import: `import { HoverCard } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/HoverCard
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/HoverCard

## Props

- `children` (required): ReactNode — Floating content
- `target` (required): ReactElement — Element that shows the card. It receives the hover / focus / press handlers directly — no wrapper, so no extra tab stop.
- `position`: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'bottom' — Position relative to target (written for LTR; mirrored in RTL). @default 'bottom'
- `offset`: number = 8 — Offset gap between target and card
- `openDelay`: number = 100 — Delay before opening (ms). @default 100
- `closeDelay`: number = 150 — Delay before closing (ms). @default 150
- `opened`: boolean — Controlled opened state
- `defaultOpened`: boolean = false — Initial opened state when uncontrolled. @default false
- `shadow`: 'none' | 'sm' | 'md' | 'lg' = 'md' — Shadow size. @default 'md'
- `radius`: RadiusValue = 'md' — Corner radius. @default 'md'
- `w`: number = fits the content, between 160 and 320 — Card width. @default fits the content, between 160 and 320
- `withArrow`: boolean = false — Show directional arrow
- `closeOnEscape`: boolean = true — Close on Escape (web) and Android back. @default true
- `onOpen`: () => void — Called when opened
- `onClose`: () => void — Called when closed
- `disabled`: boolean = false — Disable interactions
- `zIndex`: number = the theme's `popover` layer — z-index override. @default the theme's `popover` layer
- `trigger`: 'hover' | 'click' = 'hover' — `hover` (default): pointer hover or keyboard focus shows it; a press toggles it where there is no hover (touch). `click`: a press toggles it and focus moves into the card.
- `strategy`: 'fixed' | 'portal' = 'fixed' on web, 'portal' (an RN Modal) on native — Positioning strategy. @default 'fixed' on web, 'portal' (an RN Modal) on native
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

Pass the element that shows the card as `target` and the card content as children. The card opens when the pointer rests on the target or when the target receives keyboard focus, stays open while the pointer is on the card, and closes on Escape. On touch devices a tap toggles it.

```tsx
import { Avatar, Block, Button, HoverCard, Text } from '@plocks/ui';

export function Demo() {
  return (
    <HoverCard
      target={
        <Button variant="subtle" size="sm">
          @plocks
        </Button>
      }
    >
      <Block gap="xs" style={{ maxWidth: 240 }}>
        <Avatar
          fallback="PB"
          label="plocks"
          description="@plocks"
          accessibilityLabel="plocks"
        />
        <Text size="sm" c="secondary">
          Cross-platform UI components for React Native and the web.
        </Text>
      </Block>
    </HoverCard>
  );
}
```

### Click Trigger

Set `trigger="click"` for cards with interactive content: a press toggles the card, focus moves into it, and Escape or a press outside closes it and returns focus to the target.

```tsx
import { Block, Button, HoverCard, Text } from '@plocks/ui';

export function Demo() {
  return (
    <HoverCard
      trigger="click"
      w={260}
      target={
        <Button variant="outline" size="sm">
          Show details
        </Button>
      }
    >
      <Block gap="xs">
        <Text fw="semibold">Deployment #482</Text>
        <Text size="sm" c="secondary">Built from main 4 minutes ago.</Text>
        <Button size="xs" variant="subtle">
          View logs
        </Button>
      </Block>
    </HoverCard>
  );
}
```
