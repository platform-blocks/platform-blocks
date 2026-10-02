# Surface

Surface provides the base container for the library's elevated components.

## Metadata

- Import: `import { Surface } from '@plocks/ui';`
- Tags: surface, paper, elevation, container, layout
- Docs: https://plocks.dev/components/Surface
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Surface

## Props

- `children`: React.ReactNode
- `level`: 0 | 1 | 2 | 3 — Elevation step (`0`–`3`). Drives background, border color and the default shadow together, so a surface can't end up with a level-3 shadow over a level-0 fill. Omit it to derive the level from the enclosing Surface — see `raised`.
- `raised`: boolean — Take the enclosing Surface's level and add one (clamped at 3). This is what makes nesting work: a popover inside a card lands a step above the card without either one hard-coding a number.
- `withBorder`: boolean | 'auto' — Show the level's hairline border. Defaults to `'auto'`, which draws it only in dark mode — light mode conveys elevation with shadow, dark mode can't.
- `borderColor`: string — Border color override. Implies a border.
- `borderWidth`: number — Border width override in px. Implies a border.
- `padding`: SizeValue — Internal padding — size token or px. Surfaces have none by default.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useSurfaceLevel(): SurfaceLevel` — Returns the elevation level (`0`–`3`) of the nearest enclosing `Surface`, or `0` (the page) when there is none — never throws.

## Examples

### Basics

Use a Surface to give content a theme-aware background and elevation.

```tsx
import { Block, Surface, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Surface level={1} padding="md" radius="lg" fullWidth>
        <Text>Resting surface</Text>
      </Surface>
    </Block>
  );
}
```

### Elevation levels

Level 0 is the page, 1 is resting content, 2 floats over content and 3 takes over the screen. Each resolves its own background, border and shadow from `theme.surfaces`; toggle the color scheme to see the ladder switch from shadow-led to fill-led.

```tsx
import { Block, Surface, Text } from '@plocks/ui';

const LEVELS = [0, 1, 2, 3] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {LEVELS.map((level) => (
        <Surface key={level} level={level} padding="md" radius="lg" fullWidth>
          <Text size="sm">Level {level}</Text>
        </Surface>
      ))}
    </Block>
  );
}
```

### Nesting with raised

`raised` takes the enclosing Surface's level and adds one, so nested containers stack correctly without any of them hard-coding a number. Move the outer Surface to a different level and everything inside follows.

```tsx
import { Block, Surface, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Surface level={0} padding="md" radius="lg" fullWidth>
      <Block>
        <Text size="sm">Level 0</Text>
        <Surface raised padding="md" radius="lg" fullWidth>
          <Block>
            <Text size="sm">Level 1</Text>
            <Surface raised padding="md" fullWidth>
              <Text size="sm">Level 2</Text>
            </Surface>
          </Block>
        </Surface>
      </Block>
    </Surface>
  );
}
```

### Surface vs Card

Card is a Surface with padding and section semantics on top. Reach for Surface directly when you want the elevation without Card's structure — a toolbar, a sheet, a custom panel.

```tsx
import { Block, Card, Row, Surface, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Surface padding="md" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Surface</Text>
          <Text size="sm" c="muted">
            level 1
          </Text>
        </Row>
      </Surface>

      <Card variant="elevated" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Card</Text>
          <Text size="sm" c="muted">
            level 2
          </Text>
        </Row>
      </Card>
    </Block>
  );
}
```
