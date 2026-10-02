# Scroller

Use Scroller for horizontal content that should preserve native scrolling and expose visible navigation controls.

## Metadata

- Import: `import { Scroller } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Scroller
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Scroller

## Props

- `children` (required): React.ReactNode
- `controlSize`: SizeValue — Control button size.
- `startControlIcon`: React.ReactNode — Replaces the start chevron.
- `endControlIcon`: React.ReactNode — Replaces the end chevron.
- `startControlProps`: Partial<IconButtonProps> — Props forwarded to the start button.
- `endControlProps`: Partial<IconButtonProps> — Props forwarded to the end button.
- `showStartControl`: boolean — Always show the start button.
- `showEndControl`: boolean — Always show the end button.
- `edgeGradientColor`: string — Gradient end color.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `scrollAmount`: number
- `draggable`: boolean

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useScroller({ scrollAmount = 200, draggable = true }: UseScrollerOptions = {}): UseScrollerReturn`

## Examples

### Basics

Controls appear only when there is content to scroll in their direction.

```tsx
import { Badge, Block, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller>
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Badge {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
```

### Controls and Scroll Amount

`controlSize` and `scrollAmount` tune the edge controls and their movement.

```tsx
import { Badge, Block, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller scrollAmount={300} controlSize="lg" showEndControl>
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Item {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
```

### Mouse Drag Scrolling

Drag with a mouse on web; touch scrolling remains native.

```tsx
import { Badge, Block, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller draggable>
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Item {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
```

### Custom Icons

`startControlIcon` and `endControlIcon` replace the chevrons.

```tsx
import { Badge, Block, Icon, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller
        startControlIcon={<Icon name="arrow-left" />}
        endControlIcon={<Icon name="arrow-right" />}
        showStartControl
        showEndControl
      >
        {Array.from({ length: 20 }, (_, i) => (
          <Badge key={i} m="xs">
            Item {i + 1}
          </Badge>
        ))}
      </Scroller>
    </Block>
  );
}
```

### Tab-like Chips

Scroller can hold a long horizontal row of navigation chips.

```tsx
import { Block, Chip, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller>
        {Array.from({ length: 16 }, (_, i) => (
          <Chip key={i} m="xs">
            Section {i + 1}
          </Chip>
        ))}
      </Scroller>
    </Block>
  );
}
```
