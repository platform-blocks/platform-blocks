# Marquee

Use Marquee for decorative rows such as logos or short badges. It respects reduced motion settings.

## Metadata

- Import: `import { Marquee } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Marquee
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Marquee

## Props

- `children` (required): React.ReactNode
- `duration`: number = 20000 — Time for one copy to travel its length in ms. @default 20000
- `reverse`: boolean = false — Reverse travel direction. @default false
- `pauseOnHover`: boolean = false — Pause on web hover and native press. @default false
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Travel axis. @default 'horizontal'
- `repeat`: number = 4 — Number of copies. @default 4
- `gap`: SpacingValue = 'md' — Space between copies. @default 'md'
- `fadeEdges`: boolean = true — Mask the leading and trailing edges. @default true
- `fadeEdgeColor`: string — Color behind a fade edge.
- `fadeEdgeSize`: string = '5%' — Width of each edge fade. @default '5%'
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

The children repeat seamlessly; `duration` controls one cycle.

```tsx
import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee>
        {['Design', 'Build', 'Ship', 'Learn'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
```

### Vertical and Reverse

Set a fixed `h` for vertical scrolling and use `reverse` to change direction.

```tsx
import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee orientation="vertical" h={120} reverse>
        {['Alpha', 'Beta', 'Gamma'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
```

### Pause on Hover

`pauseOnHover` pauses the row when a pointer rests on it.

```tsx
import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee pauseOnHover>
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
```

### Multiple Rows

Combine forward and reverse marquees for two rows.

```tsx
import { Badge, Block, Marquee } from '@plocks/ui';

const labels = ['Alpha', 'Beta', 'Gamma', 'Delta'];
export function Demo() {
  return (
    <Block fullWidth>
      <Marquee>
        {labels.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
      <Marquee reverse mt="sm">
        {labels.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
```

### Fade Edges

`fadeEdgeSize` and `fadeEdges` control the edge treatment.

```tsx
import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee fadeEdgeSize="15%">
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
```

### Customization

`duration`, `gap`, and `repeat` tune movement and density.

```tsx
import { Badge, Block, Marquee } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Marquee duration={12000} gap="xl" repeat={5}>
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </Marquee>
    </Block>
  );
}
```
