# Card

The Card component provides a flexible container for displaying content. Six variants (`filled`, `outline`, `elevated`, `subtle`, `ghost`, `gradient`) each set their own background + default shadow. `withBorder`, `borderColor`, `borderWidth`, and `bg` compose on top of any variant, so you can mix and match (`<Card variant="elevated" withBorder bg="primary" />`) without forking a new variant for every combination.

## Metadata

- Canonical name: `Card`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Card } from '@platform-blocks/react-ui-library';`
- Category: display
- Tags: card, container, content, layout
- Docs: https://react-ui-library.com/components/Card
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Card

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | No |  | children optional to reduce noisy TS errors during composition |
| `variant` | 'outline' \| 'filled' \| 'elevated' \| 'subtle' \| 'ghost' \| 'gradient' | No |  | Visual variant. Each variant sets its own background + default shadow. - `filled` (default) — surface background - `outline` — transparent + border - `elevated` — surface with a stronger shadow - `subtle` — subtle background + soft border - `ghost` — transparent until pressed - `gradient` — primary-palette gradient overlay |
| `withBorder` | boolean | No |  | Add a 1px border on top of *any* variant. Composes with `variant="elevated"` etc. without forcing you into the `outline` variant. |
| `borderColor` | string | No |  | Custom border color. When set, implies `withBorder` if `borderWidth` isn't 0. |
| `borderWidth` | number | No |  | Custom border width in px. Defaults to 1 when `withBorder` or `borderColor` is set. |
| `clip` | boolean | No |  | Clip children to the card's radius. Turn this on when a `Card.Section` carries full-bleed content (image, code surface) that would otherwise square off the card's rounded corners. Off by default so overlays that escape the card — menus, popovers, tooltips — keep working. |
| `bg` | string | No |  | Background color override. Accepts any CSS color string or a theme color palette name (`'primary' \| 'secondary' \| 'gray' \| 'success' \| 'warning' \| 'error'`), which resolves to that palette's shade-1 (subtle tint). |
| `padding` | SizeValue | No |  | Internal padding. Accepts a size token (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'`) or a pixel number. |
| `style` | any | No |  |  |
| `onPress` | () => void | No |  | Interactive props |
| `disabled` | boolean | No |  |  |
| `onContextMenu` | (e: any) => void | No |  | Web-only events passthrough |
| `testID` | string | No |  |  |
| `accessibilityRole` | AccessibilityRole | No |  | Accessibility role forwarded to the underlying element. Pressable cards default to a button; set `'link'` when the card navigates. |
| `accessibilityLabel` | string | No |  | Accessibility label forwarded to the underlying element. |
| `accessibilityState` | AccessibilityState | No |  | Accessibility state forwarded to the underlying element. Required for the selectable roles — a card with `accessibilityRole="radio"` or `"checkbox"` has to announce its `checked` state or screen readers read every option as unselected. |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |
| `shadow` | ShadowValue | No |  | Shadow value - supports size tokens and 'none' |

## Examples

### Basics
ID: `Card.basic` • Tags: content • Category: basics • Status: stable • Since: 1.0.0

Compose card content with spacing primitives and a primary action for quick scenarios.

```tsx
return (
    <Card p="lg" radius="lg" shadow="md" maxW={320}>
      <Block>
        <Block>
          <Text variant="small" color="muted">
            Upcoming match
          </Text>
          <Text variant="h6">Falcons at Bears</Text>
        </Block>
        <Text color="muted">
          Kickoff is set for 7:30 PM with rain in the forecast. Review the lineup and
          travel logistics before departure.
        </Text>
  <Button size="sm" variant="filled" onPress={() => {}}>
          View itinerary
        </Button>
      </Block>
    </Card>
  );
}
```

### Variants
ID: `Card.variants` • Tags: surface • Category: theming • Status: stable • Since: 1.0.0

Tour the available card `variant` treatments to pick the right surface style for your layout.

```tsx
const VARIANTS = ['filled', 'outline', 'elevated', 'subtle', 'ghost', 'gradient'] as const;
  return (
    <Block>
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant} p="lg" radius="lg">
          <Block>
            <Text variant="small" color="muted">
              {String(variant).toUpperCase()} variant
            </Text>
            <Text color="muted">
              Apply the {variant} treatment to match surface contrast needs.
            </Text>
          </Block>
        </Card>
      ))}
    </Block>
  );
}
```
