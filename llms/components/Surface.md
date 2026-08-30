# Surface

The base container the rest of the library's elevated components are built from
— what other libraries call "paper".

A Surface owns exactly one decision: **how far off the page it sits.** `level`
resolves background, border color and default shadow as a set from
`theme.surfaces`, so a component can't end up with a level-3 shadow over a
level-0 fill, and no component has to pick a background color itself.

## Why a numeric ladder

Elevation is ordered and nestable, so the scale is numeric rather than a set of
named slots (`secondary`, `tertiary`, …). Two things fall out of that:

- **Nesting composes.** `raised` reads the enclosing Surface's level and adds
  one, so a popover opened inside a card lands a step above the card without
  either one knowing the other's number.
- **Scheme differences live in one place.** Light mode conveys elevation mostly
  with shadow; dark mode can't — shadows are invisible on a near-black page — so
  it uses a progressively lighter fill plus a hairline border. Encoding that in
  the ladder means call sites never branch on `colorScheme`.

## Theming

Override `surfaces` on your theme to retune every elevated component at once:

```ts
createTheme({
  surfaces: {
    0: { background: '#0B0B0F', border: '#1A1A20', shadow: 'none' },
    1: { background: '#16161C', border: '#26262E', shadow: 'xs' },
    2: { background: '#1E1E26', border: '#2E2E38', shadow: 'md' },
    3: { background: '#26262F', border: '#363642', shadow: 'xl' },
  },
})
```

Themes that don't define `surfaces` get a ladder derived from `backgrounds`
(`base` → `surface` → `elevated`), so existing custom themes keep working.

## Used by

Card sits at level 1 (2 for `variant="elevated"`); Menu, Select dropdowns and
Popover at level 2; Dialog at level 3. `useSurfaceLevel()` reports the level of
the surface the caller is rendered on, and `surfaceInteractionTint()` returns
hover/pressed/selected overlays that read correctly at any level.

## Metadata

- Canonical name: `Surface`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Surface } from '@platform-blocks/react-ui-library';`
- Category: layout
- Tags: surface, paper, elevation, container, layout
- Docs: https://react-ui-library.com/components/Surface
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Surface

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | No |  |  |
| `level` | SurfaceLevel | No |  | Elevation step (`0`–`3`). Drives background, border color and the default shadow together, so a surface can't end up with a level-3 shadow over a level-0 fill. Omit it to derive the level from the enclosing Surface — see `raised`. |
| `raised` | boolean | No |  | Take the enclosing Surface's level and add one (clamped at 3). This is what makes nesting work: a popover inside a card lands a step above the card without either one hard-coding a number. |
| `withBorder` | boolean \| 'auto' | No |  | Show the level's hairline border. Defaults to `'auto'`, which draws it only in dark mode — light mode conveys elevation with shadow, dark mode can't. |
| `borderColor` | string | No |  | Border color override. Implies a border. |
| `borderWidth` | number | No |  | Border width override in px. Implies a border. |
| `bg` | string | No |  | Background override — CSS color, a `theme.backgrounds` key, or a palette name/`palette.shade`. Wins over the level's fill. |
| `padding` | SizeValue | No |  | Internal padding — size token or px. Surfaces have none by default. |
| `style` | StyleProp<ViewStyle> | No |  |  |
| `testID` | string | No |  |  |
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

### Elevation levels
ID: `Surface.levels` • Tags: elevation, levels • Category: basics • Status: stable • Since: 0.11.0

Each level resolves its own background, border and shadow from `theme.surfaces`. Toggle the color scheme to see the ladder switch from shadow-led to fill-led.

```tsx
const LEVELS = [
  { level: 0 as const, label: 'Level 0 — the page' },
  { level: 1 as const, label: 'Level 1 — resting content' },
  { level: 2 as const, label: 'Level 2 — floating over content' },
  { level: 3 as const, label: 'Level 3 — takes over the screen' },
];
  return (
    <Block fullWidth>
      {LEVELS.map(({ level, label }) => (
        <Surface key={level} level={level} padding="md" radius="lg" fullWidth>
          <Text size="sm">{label}</Text>
        </Surface>
      ))}
    </Block>
  );
}
```

### Nesting with raised
ID: `Surface.nesting` • Tags: nesting, raised, elevation • Category: basics • Status: stable • Since: 0.11.0

`raised` takes the enclosing Surface's level and adds one, so nested containers stack correctly without any of them hard-coding a number. Move the outer Surface to a different level and everything inside follows.

```tsx
return (
    <Surface level={0} padding="md" radius="lg" fullWidth>
      <Block>
        <Text size="sm" color="muted">
          Level 0 — the page
        </Text>
        <Surface raised padding="md" radius="lg" fullWidth>
          <Block>
            <Text size="sm">Raised once → level 1</Text>
            <Surface raised padding="md" radius="md" fullWidth>
              <Text size="sm">Raised again → level 2</Text>
            </Surface>
          </Block>
        </Surface>
      </Block>
    </Surface>
  );
}
```

### Surface vs Card
ID: `Surface.as-card` • Tags: card, composition • Category: usage • Status: stable • Since: 0.11.0

Card is a Surface with padding and section semantics on top. Reach for Surface directly when you want the elevation without Card's structure — a toolbar, a sheet, a custom panel.

```tsx
return (
    <Block fullWidth>
      <Surface level={1} padding="md" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Surface — elevation only</Text>
          <Text size="sm" color="muted">
            level 1
          </Text>
        </Row>
      </Surface>
      <Card variant="elevated" padding="md" radius="lg" fullWidth>
        <Row align="center" justify="space-between">
          <Text size="sm">Card — Surface + padding + sections</Text>
          <Text size="sm" color="muted">
            level 2
          </Text>
        </Row>
      </Card>
    </Block>
  );
}
```
