# Card

The Card component provides a flexible container for displaying content.

## Metadata

- Import: `import { Card } from '@plocks/ui';`
- Tags: card, container, content, layout
- Docs: https://plocks.dev/components/Card
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Card

## Props

- `children`: React.ReactNode — children optional to reduce noisy TS errors during composition
- `variant`: 'outline' | 'filled' | 'elevated' | 'subtle' | 'ghost' | 'gradient' — Visual variant. Each variant sets its own background + default shadow. - `filled` (default) — surface background - `outline` — transparent + border - `elevated` — surface with a stronger shadow - `subtle` — subtle background + soft border - `ghost` — transparent until pressed - `gradient` — primary-palette gradient overlay
- `withBorder`: boolean — Add a 1px border on top of *any* variant. Composes with `variant="elevated"` etc. without forcing you into the `outline` variant.
- `borderColor`: string — Custom border color. When set, implies `withBorder` if `borderWidth` isn't 0.
- `borderWidth`: number — Custom border width in px. Defaults to 1 when `withBorder` or `borderColor` is set.
- `flex`: number — Layout of a card in a flex row or positioned board.
- `shrink`: number
- `position`: ViewStyle['position']
- `top`: ViewStyle['top']
- `left`: ViewStyle['left']
- `zIndex`: number
- `borderTopWidth`: number
- `borderTopColor`: string
- `borderStyle`: ViewStyle['borderStyle']
- `clip`: boolean — Clip children to the card's radius. Turn this on when a `Card.Section` carries full-bleed content (image, code surface) that would otherwise square off the card's rounded corners. Off by default so overlays that escape the card — menus, popovers, tooltips — keep working.
- `padding`: SizeValue — Internal padding. Accepts a size token (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'`) or a pixel number.
- `onPress`: () => void — Makes the card a button (or the given `role`); it is focusable and activates with Enter/Space on web.
- `disabled`: boolean — Disables `onPress` and marks the card `aria-disabled`.
- `onContextMenu`: (event: WebMouseEvent) => void — Web-only: context-menu (right-click) handler.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Compose card content with spacing primitives and a primary action for quick scenarios.

```tsx
import { Block, Button, Card, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Card p="lg" radius="lg" shadow="md" maw={320}>
      <Block>
        <Block>
          <Text variant="small" c="muted">
            Upcoming match
          </Text>
          <Text variant="h6">Falcons at Bears</Text>
        </Block>
        <Text c="muted">
          Kickoff is set for 7:30 PM with rain in the forecast. Review the lineup and
          travel logistics before departure.
        </Text>
        <Button size="sm" variant="filled">
          View itinerary
        </Button>
      </Block>
    </Card>
  );
}
```

### Variants

Tour the available card `variant` treatments to pick the right surface style for your layout.

```tsx
import { Block, Card, Text } from '@plocks/ui';

const VARIANTS = ['filled', 'outline', 'elevated', 'subtle', 'ghost', 'gradient'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant} p="lg" radius="lg">
          <Text c={variant === 'gradient' ? 'white' : undefined}>{variant}</Text>
        </Card>
      ))}
    </Block>
  );
}
```
